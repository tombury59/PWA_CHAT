import { useEffect, useState, useRef } from "react";
import { useSocket } from "../../contexts/SocketContext";

interface SocketMessage {
  pseudo: string;
  content: string;
  dateEmis: string;
  categorie: "MESSAGE" | "INFO";
}

export const useChat = (roomId: string, pseudo: string) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<SocketMessage[]>([]);

  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (!socket) return;

    if (!hasJoinedRef.current) {
      socket.emit("chat-join-room", { pseudo, roomName: roomId });


      hasJoinedRef.current = true;
    }

    const handleNewMessage = (newMessage: SocketMessage) => {
      setMessages((prevMessages) => {
        // Avoid duplicates if possible (rudimentary check by date and content)
        const exists = prevMessages.some(m =>
          m.dateEmis === newMessage.dateEmis &&
          m.content === newMessage.content &&
          m.pseudo === newMessage.pseudo
        );
        if (exists) return prevMessages;

        const updated = [...prevMessages, newMessage];
        localStorage.setItem(`chat_messages_${roomId}`, JSON.stringify(updated));
        return updated;
      });
    };

    socket.on("chat-msg", handleNewMessage);

    return () => {
      socket.off("chat-msg", handleNewMessage);
      socket.emit("chat-leave-room", { pseudo, roomName: roomId });
      hasJoinedRef.current = false;
    };
  }, [socket, roomId, pseudo]);

  // Load initial messages from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`chat_messages_${roomId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      }
    } catch (e) {
      console.error("Error loading cached messages:", e);
    }
  }, [roomId]);

  const sendMessage = (content: string) => {
    if (!socket || !content.trim()) return;
    socket.emit("chat-msg", { content, roomName: roomId });
  };

  return { messages, sendMessage };
};