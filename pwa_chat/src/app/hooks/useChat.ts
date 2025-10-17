import { useState, useEffect, useCallback } from 'react';
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
  const [isJoined, setIsJoined] = useState(false);

  const joinRoom = useCallback(() => {
    if (!socket || !pseudo || pseudo === "Anonyme") return;
    
    console.log("Joining room with pseudo:", pseudo);
    socket.emit("chat-join-room", { pseudo, roomName: roomId });
    setIsJoined(true);
  }, [socket, pseudo, roomId]);

  useEffect(() => {
    if (!socket) return;

    // Rejoint la salle quand le pseudo change ou quand le socket est disponible
    if (!isJoined && pseudo !== "Anonyme") {
      joinRoom();
    }

    const handleNewMessage = (newMessage: SocketMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    socket.on("chat-msg", handleNewMessage);

    return () => {
      socket.off("chat-msg", handleNewMessage);
    };
  }, [socket, roomId, pseudo, isJoined, joinRoom]);

  const sendMessage = (content: string) => {
    if (!socket || !content.trim() || !isJoined) return;
    socket.emit("chat-msg", { content, roomName: roomId });
  };

  return { messages, sendMessage, isJoined };
};