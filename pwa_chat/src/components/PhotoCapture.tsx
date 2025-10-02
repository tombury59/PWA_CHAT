// pwa_chat/src/components/PhotoCapture.tsx
import React, { useRef, useState } from "react";
import CameraCapture from "./CameraCapture";

interface PhotoCaptureProps {
    onPhotoChange: (photo: string) => void;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onPhotoChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showCamera, setShowCamera] = useState(false);

    const handlePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                onPhotoChange(result);
                if (Notification.permission === "granted") {
                    new Notification("Photo prise !");
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const askNotificationPermission = () => {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    };

    return (
        <div className="w-full flex flex-col gap-4 items-center">
            <div className="flex flex-row gap-2 w-full">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="font-bold py-2 px-4 rounded-lg transition flex-1"
                    style={{
                        background: "var(--secondary)",
                        color: "var(--background)"
                    }}
                >
                    Sélectionner une photo
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhoto}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => setShowCamera(true)}
                    className="font-bold py-2 px-4 rounded-lg transition flex-1"
                    style={{
                        background: "var(--secondary)",
                        color: "var(--background)"
                    }}
                >
                    Prendre une photo
                </button>
            </div>
            {showCamera && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ background: "rgba(33,32,39,0.8)" }}
                    onClick={() => setShowCamera(false)}
                >
                    <div
                        className="p-6 rounded-2xl shadow-2xl"
                        style={{ background: "var(--primary)" }}
                        onClick={e => e.stopPropagation()}
                    >
                        <CameraCapture
                            onCapture={onPhotoChange}
                            onClose={() => setShowCamera(false)}
                        />
                    </div>
                </div>
            )}
            <button
                onClick={askNotificationPermission}
                className="font-bold py-2 px-4 rounded-lg transition w-full"
                style={{
                    background: "var(--accent)",
                    color: "var(--background)"
                }}
            >
                Autoriser les notifications
            </button>
        </div>
    );
};

export default PhotoCapture;
