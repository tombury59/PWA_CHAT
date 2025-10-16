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
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    socket.on("chat-msg", handleNewMessage);

    return () => {
      socket.off("chat-msg", handleNewMessage);
    };
  }, [socket, roomId, pseudo]);

  const sendMessage = (content: string) => {
    if (!socket || !content.trim()) return;
    socket.emit("chat-msg", { content, roomName: roomId });
  };

  return { messages, sendMessage };
};