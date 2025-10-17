// src/app/ServiceWorkerRegister.tsx
"use client";
import { useEffect } from "react";

export default function ServiceWorkerRegister() {
    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            "serviceWorker" in navigator &&
            process.env.NODE_ENV === "production"
        ) {
            // Enregistrer le service worker
            window.addEventListener("load", () => {
                navigator.serviceWorker
                    .register("/worker.js", {
                        scope: "/"
                    })
                    .then((registration) => {
                        console.log("Service Worker registered:", registration);

                        // Gérer les mises à jour
                        registration.addEventListener("updatefound", () => {
                            const newWorker = registration.installing;
                            if (newWorker) {
                                newWorker.addEventListener("statechange", () => {
                                    if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                                        // Une nouvelle version est disponible
                                        console.log("Nouvelle version disponible !");
                                    }
                                });
                            }
                        });
                    })
                    .catch((error) => {
                        console.error("Service Worker registration failed:", error);
                    });
            });

            // Gérer les erreurs du service worker
            navigator.serviceWorker.addEventListener("message", (event) => {
                if (event.data && event.data.type === "ERROR") {
                    console.error("[Service Worker] Error:", event.data.message);
                }
            });
        }
    }, []);

    return null;
}
