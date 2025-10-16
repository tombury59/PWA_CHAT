"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

interface SocketMessage {
  pseudo: string;
  content: string;
  dateEmis: string;
  categorie: "MESSAGE" | "INFO" | "IMAGE";
  image?: string;
}

const SOCKET_URL = "https://api.tools.gavago.fr";

const Chat: React.FC<{ roomId: string }> = ({ roomId }) => {
  const [messages, setMessages] = useState<SocketMessage[]>([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const pseudo =
    typeof window !== "undefined"
      ? localStorage.getItem("userName") || "Anonyme"
      : "Anonyme";

  const userPhotos =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("userGalleryPhotos") || "[]")
      : [];

  // --- Connexion Socket.IO ---
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("chat-join-room", { pseudo, roomName: roomId });
    });

    newSocket.on("chat-msg", (newMessage: SocketMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, pseudo]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    socket.emit("chat-msg", { content: input, roomName: roomId });
    setInput("");
  };

  // --- Envoi d'une image ---
  const handleSendImage = (imageBase64: string) => {
    if (!socket) return;
    socket.emit("chat-msg", {
      roomName: roomId,
      categorie: "IMAGE",
      content: "[image]",
      image: imageBase64,
    });
    setShowMediaPicker(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      handleSendImage(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-6 rounded-2xl shadow-2xl bg-[var(--primary)] text-[var(--foreground)] flex flex-col h-[70vh]">
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 bg-[var(--background-light)] rounded-xl p-4 shadow-inner">
        {messages.map((msg, index) => (
          <div
            key={`${msg.dateEmis}-${index}`}
            className={`flex items-end mb-3 ${
              msg.pseudo === pseudo ? "justify-end" : "justify-start"
            }`}
          >
            {msg.categorie === "INFO" ? (
              <div className="w-full text-center text-sm text-[var(--text-muted)] italic my-2">
                {msg.content}
              </div>
            ) : msg.categorie === "IMAGE" && msg.image ? (
              <div
                className={`p-2 rounded-2xl shadow max-w-xs ${
                  msg.pseudo === pseudo
                    ? "bg-[var(--message-sent)]"
                    : "bg-[var(--message-received)]"
                }`}
              >
                <img
                  src={msg.image}
                  alt="image envoyée"
                  className="rounded-xl max-w-full"
                />
                <div className="text-xs text-[var(--text-muted)] text-right mt-1">
                  {new Date(msg.dateEmis).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ) : (
              <div
                className={`px-4 py-2 rounded-2xl shadow max-w-sm ${
                  msg.pseudo === pseudo
                    ? "bg-[var(--message-sent)] text-[var(--text-on-primary)]"
                    : "bg-[var(--message-received)] text-[var(--foreground)]"
                }`}
              >
                <div className="text-sm font-bold">{msg.pseudo}</div>
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

      {/* Sélecteur de médias (popup) */}
      {showMediaPicker && (
        <div className="mb-3 p-4 rounded-xl bg-[var(--background-light)] shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-[var(--foreground)]">Envoyer une image</h3>
            <button
              type="button"
              onClick={() => setShowMediaPicker(false)}
              className="text-[var(--text-muted)] hover:text-[var(--foreground)] text-xl"
            >
              ✕
            </button>
          </div>
          
          {/* Bouton pour uploader un fichier */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full mb-3 p-3 rounded-lg bg-[var(--accent)] text-[var(--background)] font-semibold hover:bg-[var(--accent-light)] transition flex items-center justify-center gap-2"
          >
            <span className="text-xl">📁</span>
            Choisir un fichier
          </button>

          {/* Galerie locale */}
          {userPhotos.length > 0 && (
            <>
              <div className="text-sm text-[var(--text-muted)] mb-2">Ou choisir depuis votre galerie :</div>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {userPhotos.map((photo: string, idx: number) => (
                  <img
                    key={idx}
                    src={photo}
                    alt={`photo ${idx}`}
                    className="w-full aspect-square object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-[var(--accent)] transition"
                    onClick={() => handleSendImage(photo)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Zone d'envoi */}
      <form onSubmit={handleSend} className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => setShowMediaPicker(!showMediaPicker)}
          className="p-3 rounded-xl bg-[var(--background)] text-[var(--accent)] hover:bg-[var(--background-light)] transition text-2xl"
          title="Ajouter une image"
        >
          📎
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-3 rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2"
          placeholder="Écrivez un message…"
        />
        <button
          type="submit"
          className="px-4 py-3 rounded-xl font-bold bg-[var(--accent)] text-[var(--background)] shadow-lg hover:bg-[var(--accent-light)] transition"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
};

export default function RoomChatPage() {
  const { id } = useParams();
  if (typeof id !== "string") return <div>Chargement...</div>;
  return <Chat roomId={id} />;
}