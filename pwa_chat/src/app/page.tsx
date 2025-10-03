"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Home from "../components/Home";

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        // Redirige seulement si l'utilisateur est sur la page d'accueil
        const userName = localStorage.getItem("userName");
        const userPhoto = localStorage.getItem("userPhoto");
        if (userName && userPhoto) {
            router.replace("/rooms");
        }
    }, [router]);

    return (
        <Home onStart={() => router.push("/form")} />
    );
}
