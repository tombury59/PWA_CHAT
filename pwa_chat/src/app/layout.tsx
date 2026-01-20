"use client";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import type { ReactNode } from "react";
import ServiceWorkerRegister from "./ServiceWorkerRegister";
import Loader from "../components/Loader";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { SocketProvider } from "@/contexts/SocketContext";
import ConnectionStatus from "@/components/ConnectionStatus";

export default function RootLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // ... (toute votre logique useEffect pour le loader reste ici, sans changement)
    useEffect(() => {
        const handleStart = () => setLoading(true);
        const handleComplete = () => setLoading(false);
        const origPush = router.push;
        const origReplace = router.replace;
        router.push = (...args) => {
            handleStart();
            return origPush.apply(router, args);
        };
        router.replace = (...args) => {
            handleStart();
            return origReplace.apply(router, args);
        };
        window.addEventListener("popstate", handleStart);
        window.addEventListener("DOMContentLoaded", handleComplete);
        return () => {
            router.push = origPush;
            router.replace = origReplace;
            window.removeEventListener("popstate", handleStart);
            window.removeEventListener("DOMContentLoaded", handleComplete);
        };
    }, [router]);
    useEffect(() => {
        if (loading) {
            const timer = setTimeout(() => setLoading(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [loading]);


    return (
        <html lang="fr">
            <head>
                <link rel="manifest" href="/manifest.json" />
                <link rel="icon" href="/images/icons/Logo-192x192.png" sizes="192x192" type="image/png" />
                <meta name="theme-color" content="#0070f3" />
            </head>
            <body>
                {/* 👇 2. Envelopper {children} avec le SocketProvider */}
                <SocketProvider>
                    <ConnectionStatus />
                    <ServiceWorkerRegister />
                    {loading && <Loader />}
                    {children}
                </SocketProvider>
            </body>
        </html>
    );
}