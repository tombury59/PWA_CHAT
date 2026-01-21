import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock du composant CameraCapture pour simuler une capture
vi.mock("../../components/CameraCapture", () => {
    return {
        default: ({ onCapture, onClose }: any) => (
            <div>
                <button onClick={() => onCapture("data:image/png;base64,mock")}>Mock Capture</button>
                <button onClick={onClose}>Close</button>
            </div>
        ),
    };
});

// importer après le mock pour qu'il soit pris en compte
import UserGallery from "../../components/UserGallery";

describe("UserGallery", () => {
    beforeEach(() => {
        // stub navigator.mediaDevices.getUserMedia pour éviter l'erreur en environnement de test
        // @ts-ignore
        global.navigator.mediaDevices = global.navigator.mediaDevices || {};
        // @ts-ignore
        global.navigator.mediaDevices.getUserMedia = vi.fn().mockResolvedValue({});

        localStorage.clear();
        vi.resetAllMocks();
    });

    it("affiche message quand la galerie est vide et permet d'ouvrir la caméra puis ajouter une photo et la supprimer", async () => {
        render(<UserGallery />);

        // message de galerie vide présent
        expect(screen.getByText(/Votre galerie est vide/i)).toBeDefined();

        // ouvrir la caméra
        const cameraBtn = screen.getByTitle("Prendre une photo");
        fireEvent.click(cameraBtn);

        // le mock de CameraCapture affiche un bouton "Mock Capture"
        const captureBtn = await screen.findByText("Mock Capture");
        fireEvent.click(captureBtn);

        // la photo doit apparaître
        await waitFor(() => {
            const img = screen.getByAltText(/Galerie 1/i) as HTMLImageElement;
            expect(img).toBeDefined();
            expect(img.src).toContain("data:image/png;base64,mock");
        });

        // suppression de la photo
        const deleteBtn = screen.getByTitle("Supprimer");
        fireEvent.click(deleteBtn);

        // le message de galerie vide revient
        await waitFor(() => {
            expect(screen.getByText(/Votre galerie est vide/i)).toBeDefined();
        });

        // localStorage doit être vide
        expect(localStorage.getItem("userGalleryPhotos")).toEqual(JSON.stringify([]));
    });

    it("ajoute une photo via l'input file (mock FileReader)", async () => {
        // Mock de FileReader pour retourner immédiatement une dataURL
        class MockFileReader {
            onload: ((ev: any) => void) | null = null;
            result = "data:image/png;base64,filemock";
            readAsDataURL() {
                if (this.onload) {
                    this.onload({ target: { result: this.result } });
                }
            }
        }
        // @ts-ignore
        global.FileReader = MockFileReader;

        render(<UserGallery />);

        // récupérer l'input[type="file"]
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        expect(input).toBeDefined();

        // créer un faux fichier et déclencher le change
        const file = new File(["dummy"], "photo.png", { type: "image/png" });
        fireEvent.change(input, { target: { files: [file] } });

        // attendre l'apparition de l'image
        await waitFor(() => {
            const img = screen.getByAltText(/Galerie 1/i) as HTMLImageElement;
            expect(img).toBeDefined();
            expect(img.src).toContain("data:image/png;base64,filemock");
        });

        // vérifie que localStorage contient la photo
        const stored = JSON.parse(localStorage.getItem("userGalleryPhotos") || "[]");
        expect(Array.isArray(stored) && stored.length).toBe(1);
    });
});