// TypeScript
"use client";
import React from "react";
import PhotoCapture from "./PhotoCapture";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface AccueilProps {
    onFormEnd?: () => void;
}

const Accueil: React.FC<AccueilProps> = ({ onFormEnd }) => {
    const [nom, setNom] = useLocalStorage<string | null>("userName", null);
    const [photoPreview, setPhotoPreview] = useLocalStorage<string | null>("userPhoto", null);

    const handleNomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNom(e.target.value);
    };

    const handlePhotoChange = (photo: string | null) => {
        setPhotoPreview(photo);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nom && photoPreview && onFormEnd) {
            onFormEnd();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[var(--background)] via-[var(--primary)] to-[var(--background-dark)]">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md backdrop-blur-xl bg-[var(--primary)]/80 rounded-3xl shadow-2xl p-6 sm:p-8 border border-[var(--accent)]/20"
            >
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-block p-4 bg-[var(--accent)]/10 rounded-2xl mb-3">
                        <span className="text-5xl">💬</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: "var(--accent)" }}>
                        Bienvenue
                    </h1>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        Créez votre profil pour commencer
                    </p>
                </div>

                {/* Name Input */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2" style={{ color: "var(--accent)" }}>
                        Votre nom
                    </label>
                    <input
                        type="text"
                        value={nom ?? ""}
                        onChange={handleNomChange}
                        placeholder="Entrez votre nom..."
                        className="w-full px-4 py-3 rounded-xl bg-[var(--background-light)] border-2 border-transparent focus:border-[var(--accent)] focus:outline-none transition-all text-[var(--foreground)] placeholder-[var(--text-muted)]"
                        required
                    />
                </div>

                {/* Photo Capture */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2" style={{ color: "var(--accent)" }}>
                        Votre photo
                    </label>
                    <div className="flex justify-center">
                        <PhotoCapture onPhotoCapture={handlePhotoChange} photoPreview={photoPreview} />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!nom || !photoPreview}
                    className="w-full py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        background: nom && photoPreview
                            ? "linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)"
                            : "var(--background-dark)",
                        color: "var(--background)"
                    }}
                >
                    {nom && photoPreview ? "Commencer 🚀" : "Complétez votre profil"}
                </button>

                {/* Progress Indicator */}
                <div className="mt-4 flex justify-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full transition-all ${nom ? "bg-[var(--accent)]" : "bg-[var(--background-dark)]"}`}></div>
                    <div className={`w-2.5 h-2.5 rounded-full transition-all ${photoPreview ? "bg-[var(--accent)]" : "bg-[var(--background-dark)]"}`}></div>
                </div>
            </form>
        </div>
    );
};

export default Accueil;
