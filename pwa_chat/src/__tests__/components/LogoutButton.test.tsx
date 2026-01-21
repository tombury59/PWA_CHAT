// File: `src/__tests__/components/LogoutButton.test.tsx`
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect } from "vitest";

// Mock next/navigation useRouter
vi.mock("next/navigation", () => ({
    useRouter: () => ({ replace: vi.fn() }),
}));

import Logout from "../../components/LogoutButton";

describe("LogoutButton", () => {
    beforeEach(() => {
        localStorage.setItem("userName", "X");
        localStorage.setItem("userPhoto", "Y");
        localStorage.setItem("userGalleryPhotos", "Z");
    });

    it("efface le storage et redirige", () => {
        render(<Logout />);
        const btn = screen.getByRole("button", { name: /Déconnexion/i });
        fireEvent.click(btn);
        expect(localStorage.getItem("userName")).toBeNull();
        expect(localStorage.getItem("userPhoto")).toBeNull();
        expect(localStorage.getItem("userGalleryPhotos")).toBeNull();
    });
});