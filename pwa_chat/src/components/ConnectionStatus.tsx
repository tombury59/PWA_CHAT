"use client";
import { useSocket } from "@/contexts/SocketContext";
import { useEffect, useState } from "react";

export default function ConnectionStatus() {
    const { isConnected, socket } = useSocket();
    const [show, setShow] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        // Auto-minimize after 5 seconds if connected
        if (isConnected) {
            const timer = setTimeout(() => setIsMinimized(true), 5000);
            return () => clearTimeout(timer);
        } else {
            setIsMinimized(false);
            setShow(true);
        }
    }, [isConnected]);

    if (!show) return null;

    return (
        <>
            {/* Minimized version - small dot in corner */}
            {isMinimized && isConnected ? (
                <div
                    className="fixed top-4 right-4 z-[100] cursor-pointer"
                    onClick={() => setIsMinimized(false)}
                >
                    <div className="relative">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                </div>
            ) : (
                /* Full version */
                <div
                    className={`fixed top-4 right-4 z-[100] transition-all duration-300 ${isConnected ? "cursor-pointer" : ""
                        }`}
                    onClick={() => isConnected && setIsMinimized(true)}
                >
                    <div
                        className={`backdrop-blur-md rounded-2xl shadow-2xl px-4 py-3 border transition-all duration-300 ${isConnected
                                ? "bg-green-500/20 border-green-500/50 hover:bg-green-500/30"
                                : "bg-red-500/20 border-red-500/50 animate-pulse"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            {/* Status Icon */}
                            <div className="relative">
                                {isConnected ? (
                                    <>
                                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                                        <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping opacity-75"></div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                                        <div className="absolute inset-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping opacity-75"></div>
                                    </>
                                )}
                            </div>

                            {/* Status Text */}
                            <div className="flex flex-col">
                                <span
                                    className={`text-sm font-semibold ${isConnected ? "text-green-100" : "text-red-100"
                                        }`}
                                >
                                    {isConnected ? "Connecté" : "Déconnecté"}
                                </span>
                                {isConnected && socket?.id && (
                                    <span className="text-xs text-green-200/70 font-mono">
                                        {socket.id.substring(0, 8)}
                                    </span>
                                )}
                                {!isConnected && (
                                    <span className="text-xs text-red-200/70">
                                        Reconnexion...
                                    </span>
                                )}
                            </div>

                            {/* Close button (only when connected) */}
                            {isConnected && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShow(false);
                                    }}
                                    className="ml-2 text-green-200 hover:text-white transition-colors"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
