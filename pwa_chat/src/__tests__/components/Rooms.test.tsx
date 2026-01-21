// File: `src/__tests__/components/Rooms.test.tsx`
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect } from "vitest";

// Mock child components as ES module objects (provide `default`)
vi.mock("../../components/ChannelList", () => ({
    default: () => <div>Mock ChannelList</div>,
}));
vi.mock("../../components/UserGallery", () => ({
    default: () => <div>Mock UserGallery</div>,
}));
vi.mock("../../components/LogoutButton", () => ({
    default: () => <button>Logout</button>,
}));

// Mock localStorage values used by Rooms
beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("userName", "TestUser");
    localStorage.setItem("userPhoto", "https://example.com/avatar.png");
    // Mock geolocation
    (global.navigator as any).geolocation = {
        getCurrentPosition: (success: any) =>
            success({ coords: { latitude: 1, longitude: 2 } }),
    };
    // Mock battery API if needed
    (navigator as any).getBattery = vi.fn(async () => ({
        level: 0.5,
        charging: true,
        addEventListener: vi.fn(),
    }));
});

import Rooms from "../../components/Rooms";

describe("Rooms", () => {
    it("rend le header et les composants enfants mockés", async () => {
        render(<Rooms />);
        expect(screen.getByText(/PWA Chat/i)).toBeInTheDocument();
        expect(screen.getByText(/Mock ChannelList/)).toBeInTheDocument();
        expect(screen.getByText(/Mock UserGallery/)).toBeInTheDocument();
        const profileBtn = screen.getByRole("button", { name: /TestUser/i });
        fireEvent.click(profileBtn);
        await waitFor(() => {
            expect(screen.getByText(/Logout/)).toBeInTheDocument();
        });
    });
});