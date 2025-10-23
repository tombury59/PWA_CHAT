"use client";
import React, { useState, useEffect } from "react";
import PhotoCapture from "./PhotoCapture";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface AccueilProps {
    onFormEnd?: () => void;
}

const Accueil: React.FC<AccueilProps> = ({ onFormEnd }) => {
    const [nom, setNom] = useLocalStorage("userName", "");
    const [photoPreview, setPhotoPreview] = useLocalStorage("userPhoto", null);

    const handleNomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNom(e.target.value);
    };

    const handlePhotoChange = (photo: string) => {
        setPhotoPreview(photo);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nom && photoPreview && onFormEnd) {
            onFormEnd();
        }
    };

    // Reste du JSX inchangé...
    return (
        <form
            onSubmit={handleSubmit}
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
            <button
                type="submit"
                className="mt-6 px-6 py-3 rounded-xl font-bold bg-[var(--accent)] text-[var(--background)] shadow-lg hover:bg-[var(--accent-light)] transition"
                disabled={!nom || !photoPreview}
            >
                Continuer
            </button>
        </form>
    );
};

export default Accueil;
