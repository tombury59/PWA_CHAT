// pwa_chat/src/app/rooms/[id]/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useChat } from "../../hooks/useChat";
import { useRoomStatus } from "../../hooks/useRoomStatus";

const normalizePseudo = (p: any): string => {
  if (!p) return "Anonyme";
  if (typeof p === "string") return p;
  if (typeof p === "object" && p !== null) {
    return p.username || p.name || "Anonyme";
  }
  return String(p);
};

const Chat: React.FC<{ roomId: string }> = ({ roomId }) => {
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const pseudo = typeof window !== "undefined" ? localStorage.getItem("userName") || "Anonyme" : "Anonyme";

  const { messages, sendMessage } = useChat(roomId, pseudo);
  const { clientList } = useRoomStatus();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
    setInput("");
  };

  return (
      <div className="max-w-5xl mx-auto mt-8 p-4 sm:p-6 rounded-2xl shadow-2xl bg-[var(--primary)] text-[var(--foreground)] flex flex-col md:flex-row gap-4 h-auto md:h-[70vh]">
        {/* Colonne principale - Chat */}
        <div className="flex-1 flex flex-col min-h-[50vh] md:min-h-0">
          {/* En-tête */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
              Chat – Salle {roomId}
            </h2>
            <button
                onClick={() => router.back()}
                className="px-4 py-2 rounded-lg bg-[var(--primary-dark)] text-[var(--accent)] font-bold shadow hover:bg-[var(--primary-light)] transition"
            >
              ← Retour
            </button>
          </div>

          {/* Zone des messages */}
          <div className="flex-1 overflow-y-auto mb-4 bg-[var(--background-light)] rounded-xl p-4 shadow-inner">
            {messages.map((msg, index) => (
                <div
                    key={`${msg.dateEmis}-${index}`}
                    className={`flex items-end mb-3 ${
                        normalizePseudo(msg.pseudo) === pseudo ? "justify-end" : "justify-start"
                    }`}
                >
                  {msg.categorie === "INFO" ? (
                      <div className="w-full text-center text-sm text-[var(--text-muted)] italic my-2">
                        {msg.content}
                      </div>
                  ) : (
                      <div
                          className={`px-4 py-2 rounded-2xl shadow max-w-sm ${
                              normalizePseudo(msg.pseudo) === pseudo
                                  ? "bg-[var(--message-sent)] text-[var(--text-on-primary)]"
                                  : "bg-[var(--message-received)] text-[var(--foreground)]"
                          }`}
                      >
                        <div className="text-sm font-bold">{normalizePseudo(msg.pseudo)}</div>
                        <div>{msg.content}</div>
                        <div className="text-xs text-[var(--text-muted)] text-right mt-1">
                          {new Date(msg.dateEmis).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                  )}
                </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Zone d'envoi de message */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                className="flex-1 p-3 rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2"
                placeholder="Écrivez un message…"
            />
            <button
                onClick={handleSend}
                className="px-4 py-3 rounded-xl font-bold bg-[var(--accent)] text-[var(--background)] shadow-lg hover:bg-[var(--accent-light)] transition"
            >
              Envoyer
            </button>
          </div>
        </div>

        {/* Colonne latérale - Utilisateurs présents */}
        <div className="w-full md:w-64 bg-[var(--background-light)] rounded-xl p-4 shadow-inner flex flex-col">
          <h3 className="text-lg font-bold mb-3 pb-2 border-b border-[var(--accent)]" style={{ color: "var(--accent)" }}>
            En ligne ({clientList.length})
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2">
            {clientList.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] italic">Aucun utilisateur connecté</p>
            ) : (
                clientList.map((clientPseudo, index) => (
                    <div
                        key={index}
                        className={`flex items-center gap-2 p-2 rounded-lg ${
                            normalizePseudo(clientPseudo) === pseudo
                                ? "bg-[var(--accent)] bg-opacity-20 font-bold"
                                : "bg-[var(--background)] bg-opacity-50"
                        }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm truncate">{normalizePseudo(clientPseudo)}</span>
                      {normalizePseudo(clientPseudo) === pseudo && (
                          <span className="ml-auto text-xs text-[var(--accent)]">(vous)</span>
                      )}
                    </div>
                ))
            )}
          </div>
        </div>
      </div>
  );
};

export default function RoomChatPage() {
  const { id } = useParams();
  if (typeof id !== "string") return <div>Chargement...</div>;
  return <Chat roomId={id} />;
}
