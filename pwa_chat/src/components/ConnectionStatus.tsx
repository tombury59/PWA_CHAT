"use client";
import { useSocket } from "@/contexts/SocketContext";
import { useEffect, useState } from "react";

export default function ConnectionStatus() {
    const { isConnected, socket } = useSocket();
    const [show, setShow] = useState(true);

    useEffect(() => {
        // Masquer après 3 secondes si connecté
        if (isConnected) {
            const timer = setTimeout(() => setShow(false), 3000);
            return () => clearTimeout(timer);
        } else {
            setShow(true);
        }
    }, [isConnected]);

    if (!show && isConnected) return null;

    return (
        <div
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full shadow-lg text-sm font-semibold transition-all ${isConnected
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white animate-pulse"
                }`}
            onClick={() => setShow(!show)}
        >
            {isConnected ? (
                <>
                    ✅ Connecté {socket?.id ? `(${socket.id.substring(0, 6)}...)` : ""}
                </>
            ) : (
                <>⚠️ Déconnecté - Reconnexion...</>
            )}
        </div>
    );
}
