"use client";
import React, { useState, useEffect } from "react";
import PhotoCapture from "./PhotoCapture";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface AccueilProps {
    onFormEnd?: () => void;
}

const Accueil: React.FC<AccueilProps> = ({ onFormEnd }) => {
    const [nom, setNom] = useLocalStorage<string>("userName", "");
    const [photoPreview, setPhotoPreview] = useLocalStorage<string | null>("userPhoto", null);

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

    return (
        <form
            onSubmit={handleSubmit}
            className="p-8 rounded-2xl shadow-2xl max-w-md mx-auto mt-12 flex flex-col items-center"
            style={{
                background: "var(--primary)",
                color: "var(--foreground)"
            }}
        >
            <h1 className="text-3xl font-bold mb-6">Bienvenue</h1>
            <div className="w-full mb-6">
                <input
                    type="text"
                    value={nom}
                    onChange={handleNomChange}
                    placeholder="Votre nom"
                    className="w-full p-2 rounded border"
                    required
                />
            </div>
            <PhotoCapture onPhotoCapture={handlePhotoChange} photoPreview={photoPreview} />
            <button
                type="submit"
                className="mt-6 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={!nom || !photoPreview}
            >
                Commencer
            </button>
        </form>
    );
};

export default Accueil;
