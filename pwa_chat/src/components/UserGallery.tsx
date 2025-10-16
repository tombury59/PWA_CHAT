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

    const handleDeletePhoto = (index: number) => {
        const newPhotos = photos.filter((_, idx) => idx !== index);
        setPhotos(newPhotos);
        localStorage.setItem("userGalleryPhotos", JSON.stringify(newPhotos));
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
                <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="w-32 h-32 rounded-full bg-[var(--background-light)] flex items-center justify-center mb-6 shadow-inner">
                        <svg 
                            className="w-16 h-16 opacity-30" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                            style={{ color: "var(--text-muted)" }}
                        >
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--accent)" }}>
                        Votre galerie est vide
                    </h3>
                    <p className="text-center text-[var(--text-muted)] mb-6 max-w-md">
                        Commencez à créer des souvenirs ! Ajoutez des photos depuis votre appareil ou prenez-en une directement.
                    </p>
                
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((photo, idx) => (
                        <div key={idx} className="relative group">
                            <img
                                src={photo}
                                alt={`Galerie ${idx + 1}`}
                                className="w-full h-32 object-cover rounded-xl border-2 shadow-md transition-transform group-hover:scale-105"
                                style={{ borderColor: "var(--accent)" }}
                            />
                            <button
                                onClick={() => handleDeletePhoto(idx)}
                                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                                title="Supprimer"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserGallery;