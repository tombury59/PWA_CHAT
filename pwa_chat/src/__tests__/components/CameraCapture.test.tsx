// typescript
// File: `src/__tests__/components/CameraCapture.test.tsx`
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, beforeEach, describe, it, expect } from "vitest";

// Forcer les timers réels (si des fake timers étaient actifs)
vi.useRealTimers();

// Mocker getUserMedia avant d'importer le composant
const mockStream2 = {
    getTracks: () => [{ stop: vi.fn() }],
} as any;
Object.defineProperty(global.navigator, "mediaDevices", {
    value: { getUserMedia: vi.fn(async () => mockStream2) },
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

// Mocker getContext du canvas (drawImage) et toDataURL du canvas
HTMLCanvasElement.prototype.getContext = vi.fn(() => {
    return {
        drawImage: vi.fn(),
    };
}) as any;
HTMLCanvasElement.prototype.toDataURL = vi.fn(() => "data:image/png;base64,mock");

// Importer le composant APRÈS les mocks
import CameraCapture from "../../components/CameraCapture";

describe("CameraCapture", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // s'assurer que les timers réels sont utilisés pour le compte à rebours
        vi.useRealTimers();
    });

    it("démarre la caméra et capture une image (compte à rebours)", async () => {
        const onCapture = vi.fn();
        const onClose = vi.fn();
        render(<CameraCapture onCapture={onCapture} onClose={onClose} />);

        const captureBtn = screen.getAllByRole("button", { name: /Capturer|📸 Capturer/i })[0];
        fireEvent.click(captureBtn);

        // attendre que onCapture soit appelé (compte à rebours)
        await waitFor(() => {
            expect(onCapture).toHaveBeenCalled();
        }, { timeout: 4000 });
    });

    it("appel onClose quand annuler", () => {
        const onCapture = vi.fn();
        const onClose = vi.fn();
        render(<CameraCapture onCapture={onCapture} onClose={onClose} />);
        const cancelBtn = screen.getByRole("button", { name: /Annuler|✕ Annuler/i });
        fireEvent.click(cancelBtn);
        expect(onClose).toHaveBeenCalled();
    });
});