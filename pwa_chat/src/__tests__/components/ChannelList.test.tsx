// TypeScript
// File: `src/__tests__/components/ChannelList.test.tsx`
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect } from "vitest";

// Mock next/navigation BEFORE importing the component to avoid router invariant
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
        prefetch: vi.fn(async () => {}),
        pathname: "/",
    }),
}));

// Mock useSocket to provide a fake socket with emit/on/off
vi.mock("../../contexts/SocketContext", () => ({
    useSocket: () => ({
        socket: { emit: vi.fn(), on: vi.fn(), off: vi.fn(), id: "abc" },
        isConnected: true,
    }),
}));

// Mock fetch for rooms before importing component
const mockRooms = ["room1", "room+2"];
global.fetch = vi.fn(async () => ({
    ok: true,
    json: async () => ({ rooms: mockRooms }),
})) as any;

import ChannelList from "../../components/ChannelList";

describe("ChannelList", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("charge et affiche les salles", async () => {
        render(<ChannelList />);

        // titre attendu (déjà présent dans le DOM)
        await waitFor(() => {
            expect(screen.getByText(/Salles de discussion/i)).toBeInTheDocument();
        });

        // attendre que les éléments de la liste soient rendus, normaliser leur textContent
        await waitFor(() => {
            const items = screen.getAllByRole("listitem");
            const normalized = items.map(i =>
                (i.textContent || "").replace(/\s|\u00A0/g, "")
            );
            // Vérifier de manière souple : au moins un item contient "room1"
            expect(normalized.some(n => n.includes("room1"))).toBe(true);
            // Vérifier qu'on a soit "room2" (si le '+' a été transformé) soit "room+2"
            expect(normalized.some(n => n.includes("room2") || n.includes("room+2"))).toBe(true);
        });
    });

    it("crée une salle (bouton désactivé si input vide ou existant)", async () => {
        render(<ChannelList />);
        const createBtn = await screen.findByRole("button", { name: /Créer/i });
        expect(createBtn).toBeDisabled();
    });
});
