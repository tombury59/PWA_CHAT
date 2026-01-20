import { useEffect, useState, useRef } from "react";
import { useSocket } from "@/contexts/SocketContext";

interface SocketMessage {
  pseudo: string;
  content: string;
  dateEmis: string;
  categorie: "MESSAGE" | "INFO";
}

const API_IMAGES_URL = process.env.NEXT_PUBLIC_API_IMAGES_URL || 'https://api.tools.gavago.fr/socketio/api/images';

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

    const tryFetchImageAndReplace = async (msg: SocketMessage, imageId: string) => {
      const url = `${API_IMAGES_URL}/${imageId}`;
      let attempts = 0;
      while (attempts < 5) {
        try {
          attempts += 1;
          const res = await fetch(url);
          if (!res.ok) {
            console.warn(`[useChat] fetch ${url} returned status ${res.status}`);
            // if not ok, we'll retry according to the loop
            await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempts - 1)));
            continue;
          }
          const j = await res.json();
          if (j && j.success && j.data_image) {
            console.log('[useChat] 🔁 Remplacement d\'un message avec data_image trouvé pour id', imageId);
            setMessages(prev => {
              const updated = prev.map(m => {
                if (m.dateEmis === msg.dateEmis && m.pseudo === msg.pseudo && m.content === msg.content) {
                  return { ...m, content: j.data_image };
                }
                return m;
              });
              try { localStorage.setItem(`chat_messages_${roomId}`, JSON.stringify(updated)); } catch {}
              return updated;
            });
            return;
          }
        } catch (e) {
          console.warn('[useChat] tentative', attempts, 'échec pour récupérer image', url, e);
        }
        // attendre exponentiellement
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempts - 1)));
      }
      console.warn('[useChat] abandon récupération image pour id', imageId);
    };

    const handleNewMessage = (newMessage: SocketMessage) => {
      console.log("[useChat] 📨 Nouveau message reçu:", newMessage);

      // Si le message est une notification serveur contenant un id d'image sur la dernière ligne,
      // tenter de récupérer la data_image et remplacer le message ultérieurement.
      try {
        const lines = (newMessage.content || '').trim().split('\n').map(s => s.trim()).filter(Boolean);
        if (lines.length > 0 && (newMessage.content.includes('Nouvelle image pour le user') || newMessage.content.includes("Nouvelle image pour l'user"))) {
          const potentialId = lines[lines.length - 1];
          if (potentialId && /^[a-zA-Z0-9_-]+$/.test(potentialId)) {
            // lancer récupération asynchrone (non-bloquante)
            tryFetchImageAndReplace(newMessage, potentialId);
          }
        }
      } catch (e) {
        console.warn('[useChat] erreur parsing notification image:', e);
      }

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

          // Attempt to resolve any messages that reference the API images URL
          // (e.g. messages that contain `[IMAGE] https://.../api/images/:id`) and
          // replace them with the data URI when the API returns data_image.
          (async () => {
            try {
              const candidates = parsed.map((m: SocketMessage) => ({ ...m }));
              const fetches: Promise<void>[] = [];

              candidates.forEach((m, idx) => {
                const content = (m.content || '').trim();
                // look for API images URL inside the content
                const urlMatch = content.match(/https?:\/\/[\w\-.:@\/]+\/api\/images\/(\S+)/);
                if (urlMatch) {
                  const url = urlMatch[0];
                  // schedule fetch
                  const p = fetch(url)
                    .then(res => res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`)))
                    .then(j => {
                      if (j && j.success && j.data_image) {
                        console.log('[useChat] 🔁 Remplacement URL image par data URI pour message cached', url);
                        candidates[idx].content = j.data_image;
                      }
                    })
                    .catch(err => {
                      // ignore individual errors
                      console.warn('[useChat] Erreur en récupérant image cache:', url, err);
                    });
                  fetches.push(p);
                }
              });

              if (fetches.length) await Promise.all(fetches);

              // If any replacements happened, persist and update state
              const updatedAny = candidates.some((c: SocketMessage, i: number) => c.content !== parsed[i].content);
              if (updatedAny) {
                localStorage.setItem(`chat_messages_${roomId}`, JSON.stringify(candidates));
                setMessages(candidates);
                console.log('[useChat] ✅ Messages mis à jour avec data URIs pour les images où possible');
              }
            } catch (e) {
              console.error('[useChat] Erreur lors de la résolution des images en cache:', e);
            }
          })();
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