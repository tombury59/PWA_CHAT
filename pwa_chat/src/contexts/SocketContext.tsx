"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "https://api.tools.gavago.fr";

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
    console.log("[SocketContext] Initialisation du socket vers:", SOCKET_URL);

    // On initialise le socket avec des options de reconnexion
    const socketInstance = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'], // Essayer websocket d'abord, puis polling
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 20000
    });

    setSocket(socketInstance);

    // Fonction pour gérer la connexion
    const handleConnect = () => {
      console.log("[SocketContext] ✅ Socket.IO connecté ! ID:", socketInstance.id);
      setIsConnected(true);
    };

    // Fonction pour gérer la déconnexion
    const handleDisconnect = (reason: string) => {
      console.log("[SocketContext] ❌ Socket.IO déconnecté. Raison:", reason);
      setIsConnected(false);
    };

    // Gérer les erreurs de connexion
    const handleConnectError = (error: Error) => {
      console.error("[SocketContext] ⚠️ Erreur de connexion Socket.IO:", error.message);
    };

    // Gérer les tentatives de reconnexion
    const handleReconnectAttempt = (attempt: number) => {
      console.log(`[SocketContext] 🔄 Tentative de reconnexion ${attempt}...`);
    };

    const handleReconnectFailed = () => {
      console.error("[SocketContext] ❌ Échec de reconnexion après plusieurs tentatives");
    };

    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);
    socketInstance.on("connect_error", handleConnectError);
    socketInstance.on("reconnect_attempt", handleReconnectAttempt);
    socketInstance.on("reconnect_failed", handleReconnectFailed);

    // Gérer les changements d'état du réseau
    const handleOnline = () => {
      console.log("[SocketContext] 🌐 Le navigateur est en ligne. Tentative de connexion...");
      if (!socketInstance.connected) {
        socketInstance.connect();
      }
    };

    const handleOffline = () => {
      console.log("[SocketContext] 📵 Le navigateur est hors ligne. Déconnexion.");
      socketInstance.disconnect();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // On tente une première connexion si le navigateur est déjà en ligne
    if (navigator.onLine) {
      console.log("[SocketContext] Navigator est en ligne, connexion...");
      handleOnline();
    } else {
      console.warn("[SocketContext] Navigator est hors ligne");
    }

    // On se déconnecte et on nettoie les écouteurs quand le composant est retiré
    return () => {
      console.log("[SocketContext] Nettoyage du socket");
      socketInstance.disconnect();
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
      socketInstance.off("connect_error", handleConnectError);
      socketInstance.off("reconnect_attempt", handleReconnectAttempt);
      socketInstance.off("reconnect_failed", handleReconnectFailed);
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