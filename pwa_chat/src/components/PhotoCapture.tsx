"use client";
import React, { useRef, useState, useEffect } from "react";

interface PhotoCaptureProps {
    photoPreview: string | null;
    onPhotoCapture: (photo: string | null) => void;
    maxDimension?: number; // optional: maximum width/height of the exported image
    quality?: number; // optional: JPEG quality between 0 and 1
    useThumbnail?: boolean; // optional: if true (default), returns a small thumbnail (128px). If false, respects maxDimension.
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ photoPreview, onPhotoCapture, maxDimension = 512, quality = 0.6, useThumbnail = true }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isStreaming, setIsStreaming] = useState(false);

    useEffect(() => {
        // Stop camera on unmount to avoid camera remaining active
        return () => {
            stopCamera();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsStreaming(true);
            }
        } catch (err) {
            console.error("Erreur d'accès à la caméra:", err);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && isStreaming) {
            // Use video dimensions but provide a sensible fallback when zero
            const videoWidth = videoRef.current.videoWidth || 640;
            const videoHeight = videoRef.current.videoHeight || 480;

            // Calculate target size preserving aspect ratio and respecting maxDimension
            let targetWidth = videoWidth;
            let targetHeight = videoHeight;
            const maxDim = Math.max(videoWidth, videoHeight);
            if (maxDim > maxDimension) {
                const scale = maxDimension / maxDim;
                targetWidth = Math.round(videoWidth * scale);
                targetHeight = Math.round(videoHeight * scale);
            }

            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Draw reduced (full) image onto canvas
                ctx.drawImage(videoRef.current, 0, 0, targetWidth, targetHeight);

                if (!useThumbnail) {
                    const photoData = canvas.toDataURL('image/jpeg', quality);
                    onPhotoCapture(photoData);
                    stopCamera();
                    return;
                }

                // Create a small thumbnail to store/send (much cheaper in localStorage / headers)
                try {
                    const thumbMax = 128; // px - max dimension for thumbnail stored in localStorage
                    let thumbWidth = targetWidth;
                    let thumbHeight = targetHeight;
                    const maxThumbDim = Math.max(targetWidth, targetHeight);
                    if (maxThumbDim > thumbMax) {
                        const thumbScale = thumbMax / maxThumbDim;
                        thumbWidth = Math.round(targetWidth * thumbScale);
                        thumbHeight = Math.round(targetHeight * thumbScale);
                    }

                    const thumbCanvas = document.createElement('canvas');
                    thumbCanvas.width = thumbWidth;
                    thumbCanvas.height = thumbHeight;
                    const tctx = thumbCanvas.getContext('2d');
                    if (tctx) {
                        // Draw the full reduced image into the thumbnail canvas (keeps aspect ratio)
                        tctx.drawImage(canvas, 0, 0, targetWidth, targetHeight, 0, 0, thumbWidth, thumbHeight);

                        // Export thumbnail as JPEG (small, good for avatars/storage)
                        const thumbData = thumbCanvas.toDataURL('image/jpeg', quality);
                        onPhotoCapture(thumbData);
                    } else {
                        // Fallback: export the (already reduced) main canvas
                        const photoData = canvas.toDataURL('image/jpeg', quality);
                        onPhotoCapture(photoData);
                    }
                } catch (err) {
                    // Fallback to PNG if JPEG conversion fails
                    console.warn('Thumbnail export failed, falling back to PNG', err);
                    const photoData = canvas.toDataURL('image/png');
                    onPhotoCapture(photoData);
                }
                stopCamera();
            } else {
                console.error('Impossible d obtenire le contexte du canvas');
            }
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
            // detach stream from video element
            try {
                // Some browsers keep a reference, clear it
                if (videoRef.current) videoRef.current.srcObject = null;
            } catch (e) {
                // ignore
            }
            setIsStreaming(false);
        }
    };

    return (
        <div className="flex flex-col items-center w-full">
            {!photoPreview ? (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full max-w-sm rounded mb-4"
                    />
                    {!isStreaming ? (
                        <button
                            type="button"
                            onClick={startCamera}
                            className="px-4 py-2 bg-green-500 text-white rounded"
                        >
                            Démarrer la caméra
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={capturePhoto}
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            Prendre la photo
                        </button>
                    )}
                </>
            ) : (
                <div className="relative">
                    <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full max-w-sm rounded"
                    />
                    <button
                        type="button"
                        onClick={() => onPhotoCapture(null)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
};

export default PhotoCapture;
