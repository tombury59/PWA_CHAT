// File: `src/__tests__/components/Loader.test.tsx`
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Loader from "../../components/Loader";

describe("Loader", () => {
    it("affiche le spinner", () => {
        render(<Loader />);
        const spinner = document.querySelector(".animate-spin");
        expect(spinner).toBeTruthy();
    });
});