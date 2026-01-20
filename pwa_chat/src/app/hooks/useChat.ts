import { useEffect, useState, useRef } from "react";
import { useSocket } from "../../contexts/SocketContext";

interface SocketMessage {
  pseudo: string;
  content: string;
  dateEmis: string;
  categorie: "MESSAGE" | "INFO";
}

export const useChat = (roomId: string, pseudo: string) => {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<SocketMessage[]>([]);

  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (!socket) {
      console.warn("[useChat] Socket non disponible");
      return;
    }

    console.log(`[useChat] Socket disponible. Connecté: ${isConnected}, ID: ${socket.id}`);

    if (!hasJoinedRef.current) {
      console.log(`[useChat] 🚪 Rejoindre la room "${roomId}" avec pseudo "${pseudo}"`);
      socket.emit("chat-join-room", { pseudo, roomName: roomId });
      hasJoinedRef.current = true;
    }

    const handleNewMessage = (newMessage: SocketMessage) => {
      console.log("[useChat] 📨 Nouveau message reçu:", newMessage);
      setMessages((prevMessages) => {
        // Avoid duplicates if possible (rudimentary check by date and content)
        const exists = prevMessages.some(m =>
          m.dateEmis === newMessage.dateEmis &&
          m.content === newMessage.content &&
          m.pseudo === newMessage.pseudo
        );
        if (exists) {
          console.log("[useChat] ⚠️ Message dupliqué ignoré");
          return prevMessages;
        }

        const updated = [...prevMessages, newMessage];
        localStorage.setItem(`chat_messages_${roomId}`, JSON.stringify(updated));
        console.log(`[useChat] ✅ Message ajouté. Total: ${updated.length}`);
        return updated;
      });
    };

    socket.on("chat-msg", handleNewMessage);

    return () => {
      console.log(`[useChat] 🚪 Quitter la room "${roomId}"`);
      socket.off("chat-msg", handleNewMessage);
      socket.emit("chat-leave-room", { pseudo, roomName: roomId });
      hasJoinedRef.current = false;
    };
  }, [socket, roomId, pseudo, isConnected]);

  // Load initial messages from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`chat_messages_${roomId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          console.log(`[useChat] 📂 Chargement de ${parsed.length} messages depuis le cache`);
          setMessages(parsed);
        }
      }
    } catch (e) {
      console.error("[useChat] Erreur lors du chargement des messages en cache:", e);
    }
  }, [roomId]);

  const sendMessage = (content: string) => {
    if (!socket) {
      console.error("[useChat] ❌ Impossible d'envoyer: socket non disponible");
      return;
    }
    if (!content.trim()) {
      console.warn("[useChat] ⚠️ Message vide ignoré");
      return;
    }
    console.log(`[useChat] 📤 Envoi du message: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`);
    socket.emit("chat-msg", { content, roomName: roomId });
  };

  return { messages, sendMessage };
};