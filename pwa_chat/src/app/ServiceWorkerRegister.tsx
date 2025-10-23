// pwa_chat/src/app/ServiceWorkerRegister.tsx
"use client";
import { useEffect } from "react";

export default function ServiceWorkerRegister() {
    useEffect(() => {
        if (typeof window === "undefined" || !navigator.serviceWorker) return;

        let refreshing = false;

        const handleControllerChange = () => {
            if (refreshing) return;
            refreshing = true;
            window.location.reload();
        };

        const activateNewSW = async () => {
            try {
                const registration = await navigator.serviceWorker.ready;

                // Force l'activation du nouveau SW
                if (registration.waiting) {
                    registration.waiting.postMessage({ type: "SKIP_WAITING" });
                }

                // Écoute les nouvelles installations
                registration.addEventListener("updatefound", () => {
                    const newWorker = registration.installing;
                    if (!newWorker) return;

                    newWorker.addEventListener("statechange", () => {
                        if (newWorker.state === "installed") {
                            newWorker.postMessage({ type: "SKIP_WAITING" });
                        }
                    });
                });

                // Force une mise à jour
                await registration.update();
            } catch (err) {
                console.warn("Erreur SW:", err);
            }
        };

        // Active le nouveau SW dès qu'il est disponible
        navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

        // Lance l'activation au montage
        activateNewSW();

        // Vérifie périodiquement les mises à jour
        const interval = setInterval(activateNewSW, 30000);

        return () => {
            clearInterval(interval);
            navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
        };
    }, []);

    return null;
}
