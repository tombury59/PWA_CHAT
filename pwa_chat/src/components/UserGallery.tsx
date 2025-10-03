import React, { useState, useEffect, useRef } from "react";
import CameraCapture from "./CameraCapture";

const UserGallery: React.FC = () => {
    const [photos, setPhotos] = useState<string[]>([]);
    const [showCamera, setShowCamera] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const stored = localStorage.getItem("userGalleryPhotos");
        setPhotos(stored ? JSON.parse(stored) : []);
    }, []);

    const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                addPhoto(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const addPhoto = (photo: string) => {
        const newPhotos = [...photos, photo];
        setPhotos(newPhotos);
        localStorage.setItem("userGalleryPhotos", JSON.stringify(newPhotos));
    };

    const handleCameraCapture = (photo: string) => {
        addPhoto(photo);
        setShowCamera(false);
    };

    return (
        <div className="bg-[var(--primary)] rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6 gap-2">
                <h2 className="text-2xl font-bold" style={{ color: "var(--accent)" }}>Ma galerie</h2>
                <div className="flex gap-2">
                    <button
                        title="Ajouter une image"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-12 h-12 rounded-lg bg-[var(--accent)] text-[var(--background)] font-bold shadow hover:bg-[var(--accent-light)] transition flex items-center justify-center text-2xl"
                    >
                        +
                    </button>
                    <button
                        title="Prendre une photo"
                        onClick={() => setShowCamera(true)}
                        className="w-12 h-12 rounded-lg bg-[var(--secondary)] text-[var(--background)] font-bold shadow hover:bg-[var(--primary-light)] transition flex items-center justify-center text-2xl"
                    >
                        📷
                    </button>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAddPhoto}
                />
            </div>
            {showCamera && (
                <CameraCapture
                    onCapture={handleCameraCapture}
                    onClose={() => setShowCamera(false)}
                />
            )}
            {photos.length === 0 ? (
                <div className="text-[var(--text-muted)]">Aucune image dans la galerie.</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((photo, idx) => (
                        <img
                            key={idx}
                            src={photo}
                            alt={`Galerie ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-xl border-2"
                            style={{ borderColor: "var(--accent)" }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserGallery;
