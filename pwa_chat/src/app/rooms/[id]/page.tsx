'use client';
import React, { useState } from "react";
import { useParams } from "next/navigation";
import Logout from "../../../components/LogoutButton";

interface Message {
    id: number;
    user: string;
    photo?: string;
    text: string;
    time: string;
}

const mockMessages: Message[] = [
    {
        id: 1,
        user: localStorage.getItem("userName") || "Moi",
        photo: localStorage.getItem("userPhoto") || undefined,
        text: "Bienvenue dans le chat !",
        time: "10:00"
    },
    {
        id: 2,
        user: "Alice",
        text: "Salut à tous 👋",
        time: "10:01"
    }
];

const Chat: React.FC<{ roomId: string }> = ({ roomId }) => {
    const [messages, setMessages] = useState<Message[]>(mockMessages);
    const [input, setInput] = useState("");

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        setMessages([
            ...messages,
            {
                id: messages.length + 1,
                user: localStorage.getItem("userName") || "Moi",
                photo: localStorage.getItem("userPhoto") || undefined,
                text: input,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }
        ]);
        setInput("");
    };

    return (
        <div className="max-w-2xl mx-auto mt-12 p-6 rounded-2xl shadow-2xl bg-[var(--primary)] text-[var(--foreground)] flex flex-col h-[70vh]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
                    Chat – Salle {roomId}
                </h2>
                <Logout />
            </div>
            <div className="flex-1 overflow-y-auto mb-4 bg-[var(--background-light)] rounded-xl p-4 shadow-inner">
                {messages.map(msg => (
                    <div
                        key={msg.id}
                        className={`flex items-end mb-3 ${msg.user === (localStorage.getItem("userName") || "Moi") ? "justify-end" : "justify-start"}`}
                    >
                        {msg.photo && (
                            <img
                                src={msg.photo}
                                alt={msg.user}
                                className="w-8 h-8 rounded-full mr-2 border-2"
                                style={{ borderColor: "var(--accent)" }}
                            />
                        )}
                        <div
                            className={`px-4 py-2 rounded-2xl shadow
                                ${msg.user === (localStorage.getItem("userName") || "Moi")
                                ? "bg-[var(--message-sent)] text-[var(--text-on-primary)]"
                                : "bg-[var(--message-received)] text-[var(--foreground)]"
                            }`}
                        >
                            <div className="text-sm font-bold">{msg.user}</div>
                            <div>{msg.text}</div>
                            <div className="text-xs text-[var(--text-muted)] text-right">{msg.time}</div>
                        </div>
                    </div>
                ))}
            </div>
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
    return <Chat roomId={id as string} />;
}
