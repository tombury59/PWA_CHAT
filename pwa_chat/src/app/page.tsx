// src/app/page.tsx
"use client";
import Accueil from '../components/Accueil';

export default function HomePage() {
    return (
        <main
            className="min-h-screen flex items-center justify-center"

            style={{ background: "var(--background)" }}
        >
            <Accueil />
        </main>
    );
}
