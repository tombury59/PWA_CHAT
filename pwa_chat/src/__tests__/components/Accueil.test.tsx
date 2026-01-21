// TypeScript
// File: `src/__tests__/components/Accueil.test.tsx`
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";

// Mocker PhotoCapture avant d'importer le composant testé pour éviter navigator.mediaDevices
vi.mock("../../components/PhotoCapture", () => {
    const React = require("react");
    return {
        default: ({ photoPreview, onPhotoCapture }: any) =>
            React.createElement(
                "div",
                null,
                !photoPreview
                    ? React.createElement(
                        "button",
                        { "data-testid": "mock-capture", onClick: () => onPhotoCapture("data:image/png;base64,mock") },
                        "Mock Capture"
                    )
                    : React.createElement("img", { src: photoPreview, alt: "Preview" })
            ),
    };
});

// Importer le composant après le mock
import Accueil from "../../components/Accueil";

describe("Accueil", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("affiche le formulaire avec le bouton désactivé quand nom ou photo manquent", () => {
        render(<Accueil />);
        const submit = screen.getByRole("button", { name: /Complétez votre profil|Commencer 🚀/i });
        expect(submit).toBeDisabled();

        // L'input pour le nom doit être présent
        const nameInput = screen.getByPlaceholderText(/Entrez votre nom/i) as HTMLInputElement;
        expect(nameInput).toBeInTheDocument();
        expect(nameInput.value).toBe("");
    });

    it("active le bouton après saisie du nom et capture de la photo, et appelle onFormEnd au submit", async () => {
        const onFormEnd = vi.fn();
        render(<Accueil onFormEnd={onFormEnd} />);

        const nameInput = screen.getByPlaceholderText(/Entrez votre nom/i) as HTMLInputElement;
        fireEvent.change(nameInput, { target: { value: "Alice" } });
        expect(nameInput.value).toBe("Alice");

        // Cliquer sur le bouton du mock PhotoCapture pour simuler la capture
        const captureBtn = screen.getByTestId("mock-capture");
        fireEvent.click(captureBtn);

        // Attendre que le bouton de soumission s'active (photo + nom)
        await waitFor(() => {
            const submit = screen.getByRole("button", { name: /Commencer 🚀/i });
            expect(submit).toBeEnabled();
            fireEvent.click(submit);
            expect(onFormEnd).toHaveBeenCalledTimes(1);
        });

        // Vérifier que le photoPreview a été stocké dans localStorage par le hook useLocalStorage
        const storedPhoto = localStorage.getItem("userPhoto");
        expect(storedPhoto).not.toBeNull();
        expect(storedPhoto).toContain("data:image/png;base64,mock");
    });
});
