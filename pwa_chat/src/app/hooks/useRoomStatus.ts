// pwa_chat/src/app/hooks/useRoomStatus.ts
import { useEffect, useState } from "react";
import { useSocket } from "@/contexts/SocketContext";

interface ClientInfo {
  pseudo: string | { username: string; photo: string | null };
  roomName: string;
  [key: string]: any;
}

interface Clients {
  [id: string]: ClientInfo;
}

const normalizePseudo = (p: any): string => {
  if (!p) return "inconnu";
  if (typeof p === "string") return p;
  if (typeof p === "object" && p.username) return p.username;
  return "inconnu";
};

export const useRoomStatus = () => {
  const { socket } = useSocket();
  const [clients, setClients] = useState<Clients>({});

  useEffect(() => {
    if (!socket) return;

    const handleRoomJoined = (data: { clients: Clients }) => {
      const normalizedClients: Clients = {};
      Object.entries(data.clients).forEach(([id, client]) => {
        normalizedClients[id] = {
          ...client,
          pseudo: normalizePseudo(client.pseudo)
        };
      });
      setClients(normalizedClients);
    };

    const handleUserDisconnected = (data: { id: string }) => {
      setClients(current => {
        const newClients = { ...current };
        delete newClients[data.id];
        return newClients;
      });
    };

    socket.on("chat-joined-room", handleRoomJoined);
    socket.on("chat-disconnected", handleUserDisconnected);

    return () => {
      socket.off("chat-joined-room", handleRoomJoined);
      socket.off("chat-disconnected", handleUserDisconnected);
    };
  }, [socket]);

  const clientList = Object.values(clients).map(client => normalizePseudo(client.pseudo));

  return { clientList };
};
