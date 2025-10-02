import React, { useRef, useEffect, useState } from "react";

interface CameraCaptureProps {
    onCapture: (photo: string) => void;
    onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isFlashing, setIsFlashing] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);

    useEffect(() => {
        let stream: MediaStream;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" }
                });
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (error) {
                console.error("Erreur d'accès à la caméra:", error);
            }
        };
        startCamera();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        };
    }, []);

    const takePhoto = () => {
        setCountdown(3);
        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev === 1) {
                    clearInterval(countdownInterval);
                    captureImage();
                    return null;
                }
                return prev! - 1;
            });
        }, 1000);
    };

    // Correction dans CameraCapture.tsx
    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            setIsFlashing(true);
            setTimeout(() => setIsFlashing(false), 200);

            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL("image/png");
                onCapture(dataUrl);
                setTimeout(() => onClose(), 0);
            }
        }
    };


    return (
        <div className="fixed inset-0 bg-[#264653] flex items-center justify-center p-4 z-50">
            {/* Flash effect */}
            {isFlashing && (
                <div className="fixed inset-0 bg-white animate-pulse z-50 opacity-80" />
            )}

            <div className="relative w-full max-w-md">
                {/* Decorative circles */}
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#2A9D8F] rounded-full opacity-20 blur-3xl" />
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#E76F51] rounded-full opacity-20 blur-3xl" />

                {/* Main container */}
                <div className="relative bg-gradient-to-br from-[#2D5464] to-[#1F3943] rounded-3xl p-6 shadow-2xl border border-[#2A9D8F]/30">

                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-[#F4A261] mb-2">
                            Souriez ! 📸
                        </h2>
                        <p className="text-[#C8D5DB] text-sm">
                            Capturez votre meilleur profil
                        </p>
                    </div>

                    {/* Video frame with creative border */}
                    <div className="relative mb-6 group">
                        {/* Animated corner decorations */}
                        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-[#2A9D8F] rounded-tl-2xl transition-all group-hover:w-12 group-hover:h-12" />
                        <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-[#E9C46A] rounded-tr-2xl transition-all group-hover:w-12 group-hover:h-12" />
                        <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-[#E76F51] rounded-bl-2xl transition-all group-hover:w-12 group-hover:h-12" />
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-[#F4A261] rounded-br-2xl transition-all group-hover:w-12 group-hover:h-12" />

                        {/* Video element */}
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full aspect-square object-cover rounded-2xl shadow-xl"
                        />

                        {/* Countdown overlay */}
                        {countdown && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl backdrop-blur-sm">
                                <div className="text-[#F4A261] text-8xl font-bold animate-bounce">
                                    {countdown}
                                </div>
                            </div>
                        )}

                        {/* Grid overlay for composition */}
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20 pointer-events-none rounded-2xl overflow-hidden">
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className="border border-white/30" />
                            ))}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="space-y-3">
                        {/* Capture button - Design circulaire original */}
                        <div className="flex justify-center mb-4">
                            <button
                                type="button"
                                onClick={takePhoto}
                                disabled={countdown !== null}
                                className="relative group disabled:opacity-50"
                            >
                                {/* Outer ring */}
                                <div className="w-20 h-20 rounded-full border-4 border-[#2A9D8F] flex items-center justify-center group-hover:border-[#3CB4A4] transition-all group-hover:scale-110">
                                    {/* Inner button */}
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2A9D8F] to-[#238276] shadow-lg group-hover:shadow-[#2A9D8F]/50 transition-all" />
                                </div>
                                {/* Pulse effect */}
                                <div className="absolute inset-0 rounded-full bg-[#2A9D8F] opacity-0 group-hover:opacity-20 animate-ping" />
                            </button>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-gradient-to-r from-[#355869] to-[#2D5464] text-white font-semibold py-3 px-4 rounded-xl hover:from-[#3E6478] hover:to-[#355869] transition-all transform hover:scale-105 shadow-lg border border-[#F4A261]/20"
                            >
                                ✕ Annuler
                            </button>

                            <button
                                type="button"
                                onClick={takePhoto}
                                disabled={countdown !== null}
                                className="flex-1 bg-gradient-to-r from-[#E76F51] to-[#D35A3E] text-white font-semibold py-3 px-4 rounded-xl hover:from-[#EB8567] hover:to-[#E76F51] transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                📸 Capturer
                            </button>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="mt-4 text-center text-xs text-[#8FA5AE] space-y-1">
                        <p>💡 Astuce : Centrez votre visage dans le cadre</p>
                        <p>⚡ Le compte à rebours démarre automatiquement</p>
                    </div>
                </div>
            </div>

            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    );
};

export default CameraCapture;
