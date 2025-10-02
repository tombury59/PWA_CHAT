// src/components/Accueil.tsx
import React, { useState } from "react";
import PhotoCapture from "./PhotoCapture";

const Accueil: React.FC = () => {
    const [nom, setNom] = useState<string>("");
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const handleNomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNom(e.target.value);
        localStorage.setItem("userName", e.target.value);
    };

    const handlePhotoChange = (photo: string) => {
        setPhotoPreview(photo);
        localStorage.setItem("userPhoto", photo);
    };

    return (
        <div
            className="p-8 rounded-2xl shadow-2xl max-w-md mx-auto mt-12 flex flex-col items-center"
            style={{
                background: "var(--primary)",
                color: "var(--foreground)"
            }}
        >
            {photoPreview ? (
                <img
                    src={photoPreview}
                    alt="Photo de profil"
                    className="w-32 h-32 rounded-3xl object-cover border-4 shadow mb-6"
                    style={{
                        borderColor: "var(--accent)"
                    }}
                />
            ) : (
                <div
                    className="w-32 h-32 rounded-full flex items-center justify-center mb-6 text-4xl"
                    style={{
                        background: "var(--background)",
                        color: "var(--accent)"
                    }}
                >
                    <span>👤</span>
                </div>
            )}
            <h1
                className="text-3xl font-extrabold mb-6"
                style={{ color: "var(--accent)" }}
            >
                Bienvenue !
            </h1>
            <label
                className="block mb-2 font-bold"
                style={{ color: "var(--accent)" }}
            >
                Votre nom :
            </label>
            <input
                type="text"
                value={nom}
                onChange={handleNomChange}
                className="border-none p-3 rounded-lg mb-6 w-full focus:outline-none focus:ring-2 transition"
                style={{
                    background: "var(--background)",
                    color: "var(--foreground)",
                    boxShadow: "0 0 0 2px var(--accent)"
                }}
                placeholder="Entrez votre nom"
            />
            <PhotoCapture onPhotoChange={handlePhotoChange} />
        </div>
    );
};

export default Accueil;
