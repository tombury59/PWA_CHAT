// File: `src/__tests__/components/Home.test.tsx`
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Home from "../../components/Home";

describe("Home", () => {
    it("rend le contenu et appelle onStart", () => {
        const onStart = vi.fn();
        render(<Home onStart={onStart} />);
        expect(screen.getByText(/Bienvenue sur PWA Chat/i)).toBeInTheDocument();
        const btn = screen.getByRole("button", { name: /Accéder au chat/i });
        fireEvent.click(btn);
        expect(onStart).toHaveBeenCalled();
    });
});