// File: `src/__tests__/components/PhotoCapture.test.tsx`
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, beforeEach, describe, it, expect } from "vitest";

// Mocker getUserMedia avant d'importer le composant
const mockStream = { getTracks: () => [{ stop: vi.fn() }] } as any;
Object.defineProperty(global.navigator, "mediaDevices", {
    value: { getUserMedia: vi.fn(async () => mockStream) },
    writable: true,
});

// Fournir des dimensions non-nulles pour la video
Object.defineProperty(HTMLVideoElement.prototype, "videoWidth", {
    configurable: true,
    get: () => 640,
});
Object.defineProperty(HTMLVideoElement.prototype, "videoHeight", {
    configurable: true,
    get: () => 480,
});

// Mocker le contexte 2D du canvas (drawImage + toDataURL)
HTMLCanvasElement.prototype.getContext = vi.fn(() => {
    return {
        drawImage: vi.fn(),
        // toDataURL doit renvoyer une data URL valide pour que onPhotoCapture recoive quelque chose
        toDataURL: vi.fn(() => "data:image/png;base64,mock"),
    };
}) as any;

import PhotoCapture from "../../components/PhotoCapture";

describe("PhotoCapture", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it("démarre la caméra puis capture et appelle onPhotoCapture", async () => {
        const onPhotoCapture = vi.fn();
        render(<PhotoCapture photoPreview={null} onPhotoCapture={onPhotoCapture} />);

        // Démarrer la caméra
        const startBtn = screen.getByRole("button", { name: /Démarrer la caméra/i });
        fireEvent.click(startBtn);

        // Attendre l'apparition du bouton "Prendre la photo" puis cliquer
        const takeBtn = await screen.findByRole("button", { name: /Prendre la photo/i });
        fireEvent.click(takeBtn);

        // Vérifier que onPhotoCapture a été appelé (toDataURL mockée)
        await waitFor(() => {
            expect(onPhotoCapture).toHaveBeenCalled();
        });
    });

    it("affiche l'aperçu et permet de le supprimer", () => {
        const mockData = "data:image/png;base64,mock";
        const onPhotoCapture = vi.fn();
        render(<PhotoCapture photoPreview={mockData} onPhotoCapture={onPhotoCapture} />);
        const img = screen.getByAltText("Preview") as HTMLImageElement;
        expect(img.src).toContain("data:image/png;base64,mock");
        const removeBtn = screen.getByRole("button", { name: "✕" });
        fireEvent.click(removeBtn);
        expect(onPhotoCapture).toHaveBeenCalledWith(null);
    });
});
