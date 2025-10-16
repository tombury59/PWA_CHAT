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
    // On initialise le socket sans le connecter automatiquement
    const socketInstance = io(SOCKET_URL, {
      autoConnect: false
    });

    setSocket(socketInstance);

    // Fonction pour gérer la connexion
    const handleConnect = () => {
      console.log("Socket.IO connecté !");
      setIsConnected(true);
    };

    // Fonction pour gérer la déconnexion
    const handleDisconnect = () => {
      console.log("Socket.IO déconnecté.");
      setIsConnected(false);
    };

    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);

    // Gérer les changements d'état du réseau
    const handleOnline = () => {
      console.log("Le navigateur est en ligne. Tentative de connexion...");
      socketInstance.connect();
    };

    const handleOffline = () => {
      console.log("Le navigateur est hors ligne. Déconnexion.");
      socketInstance.disconnect();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // On tente une première connexion si le navigateur est déjà en ligne
    if (navigator.onLine) {
      handleOnline();
    }

    // On se déconnecte et on nettoie les écouteurs quand le composant est retiré
    return () => {
      socketInstance.disconnect();
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};