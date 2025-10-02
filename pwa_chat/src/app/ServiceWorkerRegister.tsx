// src/app/ServiceWorkerRegister.tsx
"use client";
import { useEffect } from "react";
export default function ServiceWorkerRegister() {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/service-worker.js");
        }
    }, []);
    return null;
}
