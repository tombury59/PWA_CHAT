"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

// L'interface pour les messages, alignée avec la documentation de ton API
interface SocketMessage {
    pseudo: string;
    content: string;
    dateEmis: string; // La date est une chaîne de caractères (ISO string)
    categorie: "MESSAGE" | "INFO";
}

const SOCKET_URL = "https://api.tools.gavago.fr";

const Chat: React.FC<{ roomId: string }> = ({ roomId }) => {
    const [messages, setMessages] = useState<SocketMessage[]>([]);
    const [input, setInput] = useState("");
    const [socket, setSocket] = useState<Socket | null>(null);
    const router = useRouter();
    const chatEndRef = useRef<HTMLDivElement>(null); // Pour scroller automatiquement

    const pseudo = typeof window !== "undefined" ? localStorage.getItem("userName") || "Anonyme" : "Anonyme";

    // Effet pour gérer la connexion et les événements Socket.IO
    useEffect(() => {
        // 1. Connexion au serveur
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        // 2. Événement de connexion : on rejoint la salle
        newSocket.on("connect", () => {
            console.log("Connecté au serveur ! ID:", newSocket.id);
            newSocket.emit("chat-join-room", {
                pseudo,
                roomName: roomId,
            });
        });

        // 3. Événement de réception de message
        newSocket.on("chat-msg", (newMessage: SocketMessage) => {
            setMessages(prevMessages => [...prevMessages, newMessage]);
        });

        // (Optionnel) Gérer les erreurs du serveur
        newSocket.on("error", (msg: string) => {
            alert(`Erreur du serveur: ${msg}`);
        });

        // 4. Nettoyage : on se déconnecte quand le composant est retiré
        return () => {
            newSocket.disconnect();
        };
    }, [roomId, pseudo]); // On relance l'effet si roomId ou pseudo change

    // Effet pour scroller vers le bas à chaque nouveau message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        // On vérifie que le message n'est pas vide et que le socket est connecté
        if (!input.trim() || !socket) return;

        // 5. Envoi du message au serveur via Socket.IO
        socket.emit("chat-msg", {
            content: input,
            roomName: roomId,
        });

        setInput(""); // On vide le champ de saisie
    };

    return (
        <div className="max-w-2xl mx-auto mt-12 p-6 rounded-2xl shadow-2xl bg-[var(--primary)] text-[var(--foreground)] flex flex-col h-[70vh]">
            {/* EN-TÊTE */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
                    Chat – Salle {roomId}
                </h2>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--accent)] font-bold shadow hover:bg-[var(--primary-light)] transition"
                >
                    ← Retour
                </button>
            </div>

            {/* ZONE DES MESSAGES */}
            <div className="flex-1 overflow-y-auto mb-4 bg-[var(--background-light)] rounded-xl p-4 shadow-inner">
                {messages.map((msg, index) => (
                    // On utilise une clé unique
                    <div
                        key={`${msg.dateEmis}-${index}`}
                        className={`flex items-end mb-3 ${msg.pseudo === pseudo ? "justify-end" : "justify-start"}`}
                    >
                        {/* Affiche les messages de type INFO au centre */}
                        {msg.categorie === "INFO" ? (
                             <div className="w-full text-center text-sm text-[var(--text-muted)] italic my-2">
                                {msg.content}
                            </div>
                        ) : (
                            // Affiche les messages normaux
                            <div
                                className={`px-4 py-2 rounded-2xl shadow max-w-sm
                                    ${msg.pseudo === pseudo
                                    ? "bg-[var(--message-sent)] text-[var(--text-on-primary)]"
                                    : "bg-[var(--message-received)] text-[var(--foreground)]"
                                }`}
                            >
                                <div className="text-sm font-bold">{msg.pseudo}</div>
                                <div>{msg.content}</div>
                                <div className="text-xs text-[var(--text-muted)] text-right mt-1">
                                    {new Date(msg.dateEmis).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {/* Élément vide pour forcer le scroll vers le bas */}
                <div ref={chatEndRef} />
            </div>

            {/* FORMULAIRE D'ENVOI */}
            <form onSubmit={handleSend} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="flex-1 p-3 rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2"
                    placeholder="Écrivez un message…"
                    style={{ boxShadow: "0 0 0 2px var(--accent)" }}
                />
                <button
                    type="submit"
                    className="px-6 py-3 rounded-xl font-bold bg-[var(--accent)] text-[var(--background)] shadow-lg hover:bg-[var(--accent-light)] transition"
                >
                    Envoyer
                </button>
            </form>
        </div>
    );
};

export default function RoomChatPage() {
    const { id } = useParams();
    // Gérer le cas où 'id' pourrait ne pas être une chaîne
    if (typeof id !== "string") {
        return <div>Chargement de la salle...</div>;
    }
    return <Chat roomId={id} />;
}