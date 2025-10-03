// src/app/page.tsx
"use client";
import { useState, useEffect } from "react";
import Home from '../components/Home';
import Accueil from '../components/Accueil';
import Rooms from '../components/Rooms';

export default function HomePage() {
    const [step, setStep] = useState<"home" | "form" | "rooms">("home");

    useEffect(() => {
        // Lecture du localStorage côté client
        const savedStep = localStorage.getItem("step") as "home" | "form" | "rooms" | null;
        const userName = localStorage.getItem("userName");
        const userPhoto = localStorage.getItem("userPhoto");
        if (savedStep) {
            setStep(savedStep);
        } else if (userName && userPhoto) {
            setStep("rooms");
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("step", step);
    }, [step]);

    return (
        <main
            className="min-h-screen flex items-center justify-center"
            style={{ background: "var(--background)" }}
        >
            {step === "home" && <Home onStart={() => setStep("form")} />}
            {step === "form" && <Accueil onFormEnd={() => setStep("rooms")} />}
            {step === "rooms" && <Rooms />}
        </main>
    );
}
