// File: `src/__tests__/components/ConnectionStatus.test.tsx`
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock du hook useSocket
vi.mock("../../contexts/SocketContext", () => ({
    useSocket: () => ({ socket: { id: "socket1234" }, isConnected: true }),
}));

import ConnectionStatus from "../../components/ConnectionStatus";

describe("ConnectionStatus", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("affiche l'état connecté et l'id abrégé", () => {
        render(<ConnectionStatus />);
        expect(screen.getByText(/Connecté/i)).toBeInTheDocument();
        // utiliser une string, pas une RegExp, avant d'appeler substring
        expect(screen.getByText("socket1234".substring(0, 8))).toBeInTheDocument();
    });

    it("minimise quand on clique", () => {
        render(<ConnectionStatus />);
        const container = screen.getByText(/Connecté/i).closest("div")!;
        fireEvent.click(container);
        // Le mode minimisé affiche un petit point avec classes `w-3 h-3`
        expect(document.querySelector(".w-3.h-3")).not.toBeNull();
    });
});
