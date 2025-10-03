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

    // Gère la capture et la fermeture du modal
    const handleCameraCapture = (photo: string) => {
        onPhotoChange(photo);
        setShowCamera(false);
        if (Notification.permission === "granted") {
            new Notification("Photo prise !");
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
                <CameraCapture
                    onCapture={handleCameraCapture}
                    onClose={() => setShowCamera(false)}
                />
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