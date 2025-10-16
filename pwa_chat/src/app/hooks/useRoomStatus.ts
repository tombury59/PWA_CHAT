import { useEffect, useState } from "react";
import { useSocket } from "@/contexts/SocketContext"; // Adaptez le chemin

// Le serveur envoie un objet, donc on définit son type
interface Clients {
  [id: string]: {
    pseudo: string;
    // Ajoutez d'autres propriétés si le serveur en envoie
  };
}

export const useRoomStatus = () => {
  const { socket } = useSocket();
  const [clients, setClients] = useState<Clients>({});

  useEffect(() => {
    if (!socket) return;

    // Se déclenche quand on rejoint une salle ou quand qqn d'autre rejoint
    const handleRoomJoined = (data: { clients: Clients }) => {
      setClients(data.clients);
    };

    // Se déclenche quand un utilisateur se déconnecte
    const handleUserDisconnected = (data: { id: string }) => {
      setClients((currentClients) => {
        const newClients = { ...currentClients };
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

  // On retourne la liste des clients sous forme de tableau simple pour l'affichage
  const clientList = Object.values(clients).map(client => client.pseudo);

  return { clientList };
};