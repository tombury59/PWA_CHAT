"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "https://api.tools.gavago.fr";

// On crée un type pour notre contexte
interface ISocketContext {
  socket: Socket | null;
  isConnected: boolean;
}

// On crée le contexte avec une valeur par défaut
const SocketContext = createContext<ISocketContext>({
  socket: null,
  isConnected: false,
});

// C'est un "custom hook" qui simplifie l'accès au contexte
export const useSocket = () => {
  return useContext(SocketContext);
};

// C'est le composant qui va "fournir" le socket à toute ton app
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // On se connecte au serveur
    const socketInstance = io(SOCKET_URL);

    socketInstance.on("connect", () => {
      console.log("Socket.IO connecté !");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket.IO déconnecté.");
      setIsConnected(false);
    });

    setSocket(socketInstance);

    // On se déconnecte quand le composant est retiré
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};