"use client";
import React, { useRef, useState } from "react";

interface PhotoCaptureProps {
    photoPreview: string | null;
    onPhotoCapture: (photo: string) => void;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ photoPreview, onPhotoCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isStreaming, setIsStreaming] = useState(false);

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
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                const photoData = canvas.toDataURL('image/jpeg');
                onPhotoCapture(photoData);
                stopCamera();
            }
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
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
                        onClick={() => onPhotoCapture("")}
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
