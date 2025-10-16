// src/lib/offline-sync.ts

// --- Fonctions utilitaires pour localStorage ---

// Vérifie si nous sommes côté client avant d'accéder à localStorage
const isClient = typeof window !== 'undefined';

const getFromStorage = <T>(key: string, defaultValue: T): T => {
    if (!isClient) return defaultValue;
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Erreur lors de la lecture de "${key}" depuis localStorage`, error);
        return defaultValue;
    }
};

const saveToStorage = (key: string, value: any) => {
    if (!isClient) return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Erreur lors de la sauvegarde de "${key}" dans localStorage`, error);
    }
};

// --- Clés pour le localStorage ---
const OUTBOX_KEY = 'pwa-chat-outbox';
const MESSAGES_CACHE_KEY = 'pwa-chat-messages-cache';


// --- Implémentation pour les messages à envoyer (outbox) ---

export async function saveMessageToSend(message: object) {
    const outbox = getFromStorage<any[]>(OUTBOX_KEY, []);
    outbox.push(message);
    saveToStorage(OUTBOX_KEY, outbox);
}

export async function getMessagesToSend(): Promise<any[]> {
    return getFromStorage<any[]>(OUTBOX_KEY, []);
}

export async function clearSentMessages() {
    if (isClient) {
        localStorage.removeItem(OUTBOX_KEY);
    }
}


// --- Implémentation pour mettre en cache les messages reçus ---

export async function saveReceivedMessages(roomId: string, messages: any[]) {
    const messagesCache = getFromStorage<Record<string, any[]>>(MESSAGES_CACHE_KEY, {});
    messagesCache[`room-${roomId}`] = messages;
    saveToStorage(MESSAGES_CACHE_KEY, messagesCache);
}

export async function getCachedMessages(roomId: string): Promise<any[]> {
    const messagesCache = getFromStorage<Record<string, any[]>>(MESSAGES_CACHE_KEY, {});
    return messagesCache[`room-${roomId}`] || [];
}

