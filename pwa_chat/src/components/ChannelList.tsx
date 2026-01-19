"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "../contexts/SocketContext";

const API_URL = "https://api.tools.gavago.fr/socketio/api/rooms";

const decodeRoomName = (encodedName: string): string => {
    try {
        return decodeURIComponent(
            decodeURIComponent(
                encodedName.replace(/\+/g, ' ')
            )
        );
    } catch {
        return encodedName;
    }
};

const ChannelList: React.FC = () => {
    const [rooms, setRooms] = useState<string[]>([]);
    const [localRooms, setLocalRooms] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newRoom, setNewRoom] = useState("");
    const [creating, setCreating] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();
    const { socket } = useSocket();
    const [notifications, setNotifications] = useState<Record<string, boolean>>({});

    const filteredRooms = localRooms.filter(room =>
        decodeRoomName(room).toLowerCase().includes(newRoom.toLowerCase())
    );

    // Initial load of notification preferences
    useEffect(() => {
        const loaded: Record<string, boolean> = {};
        const storedKeys = Object.keys(localStorage).filter(k => k.startsWith("notif_"));
        storedKeys.forEach(key => {
            const roomName = key.replace("notif_", "");
            loaded[roomName] = true;
        });
        setNotifications(loaded);
    }, []);

    // Socket management for notifications
    // Socket management for notifications
    useEffect(() => {
        if (!socket) return;
        const pseudo = localStorage.getItem("userName") || "Anonyme";
        // Allow a 5-second buffer for clock skew or network delay to prevent missing "live" messages
        const startTime = Date.now() - 5000;

        // Join rooms that have notifications enabled
        Object.entries(notifications).forEach(([room, enabled]) => {
            if (enabled) {
                socket.emit("chat-join-room", { pseudo, roomName: room });
            }
        });

        const handleMsg = (msg: any) => {
            console.log("DEBUG MSG:", msg);
            if (msg.categorie === "INFO") return;
            if (msg.pseudo === pseudo) return;

            // Ignore messages older than when we started listening (history)
            const msgTime = new Date(msg.dateEmis).getTime();
            if (msgTime < startTime) return;

            if (Notification.permission === "granted") {
                new Notification(`Message de ${msg.pseudo}`, {
                    body: msg.content,
                    requireInteraction: false
                });
            }
        };

        socket.on("chat-msg", handleMsg);

        return () => {
            socket.off("chat-msg", handleMsg);
        };
    }, [socket, notifications]);

    const toggleNotification = (e: React.MouseEvent, room: string) => {
        e.stopPropagation();

        if (Notification.permission === "denied") {
            alert("Notifications bloquées. Veuillez les autoriser dans les paramètres du site.");
        } else if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        setNotifications(prev => {
            const newState = !prev[room];
            const pseudo = localStorage.getItem("userName") || "Anonyme";

            if (newState) {
                localStorage.setItem(`notif_${room}`, 'true');
                socket?.emit("chat-join-room", { pseudo, roomName: room });
            } else {
                localStorage.removeItem(`notif_${room}`);
                socket?.emit("chat-leave-room", { pseudo, roomName: room });
            }
            return { ...prev, [room]: newState };
        });
    };

    const parseRoomsResponse = (json: any): string[] => {
        if (!json) return [];
        if (json.data && typeof json.data === "object" && !Array.isArray(json.data)) {
            return Object.keys(json.data);
        }
        if (json.data && typeof json.data === "string") {
            try {
                const parsed = JSON.parse(json.data);
                if (Array.isArray(parsed)) return parsed.map(String);
                if (typeof parsed === "object" && parsed !== null) return Object.keys(parsed);
            } catch (e) { }
        }
        if (Array.isArray(json)) return json.map(String);
        if (Array.isArray(json.rooms)) return json.rooms.map(String);
        if (typeof json === "object" && json !== null) {
            return Object.keys(json);
        }
        return [];
    };

    const fetchRooms = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);
        try {
            const res = await fetch(API_URL, { cache: "no-store" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            const parsed = parseRoomsResponse(json);
            setRooms(parsed);
            setLocalRooms(parsed);
        } catch (err: any) {
            console.error("Erreur fetchRooms:", err);
            setError(err?.message ?? String(err));
            setRooms([]);
            setLocalRooms([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleDeleteRoom = (roomToDelete: string) => {
        setLocalRooms(current => current.filter(room => room !== roomToDelete));
    };

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        // Prevent creation if filtering found matches or input empty
        if (!newRoom.trim() || filteredRooms.length > 0) return;

        setCreating(true);
        setError(null);
        try {
            const roomName = newRoom.trim();
            const res = await fetch(`https://api.tools.gavago.fr/socketio/chat/${roomName}`, {
                method: 'GET',
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await fetchRooms();
            setNewRoom("");
            router.push(`/rooms/${roomName}`);
        } catch (err: any) {
            setError(err?.message ?? String(err));
        } finally {
            setCreating(false);
        }
    };


    useEffect(() => {
        fetchRooms();
    }, []);

    return (
        <div className="bg-[var(--primary)] rounded-2xl p-4 sm:p-5 md:p-6 shadow-xl max-w-full">
            <div className="flex flex-col gap-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--accent)" }}>
                    Salles de discussion
                </h2>

                <form onSubmit={handleCreateRoom} className="flex flex-col sm:flex-row gap-2">
                    <div className="flex gap-2 flex-1">
                        <input
                            type="text"
                            value={newRoom}
                            onChange={(e) => setNewRoom(e.target.value)}
                            placeholder="Rechercher ou créer une salle..."
                            className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-[var(--background-light)] text-[var(--text)] border border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                            disabled={creating}
                            maxLength={50}
                        />
                        <button
                            type="submit"
                            disabled={creating || !newRoom.trim() || filteredRooms.length > 0}
                            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--background)] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all whitespace-nowrap"
                        >
                            {creating ? "..." : "Créer"}
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => fetchRooms(true)}
                        disabled={refreshing}
                        className="px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--background)] font-semibold hover:opacity-90 transition-all disabled:opacity-50 sm:w-auto"
                        aria-label="Actualiser la liste"
                    >
                        <span className={refreshing ? "inline-block animate-spin" : ""}>↻</span>
                        <span className="ml-2 sm:hidden">Actualiser</span>
                    </button>
                </form>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <p className="text-sm text-red-400">⚠️ Erreur: {error}</p>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="text-[var(--text-muted)] flex items-center gap-2">
                        <span className="inline-block w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></span>
                        Chargement…
                    </div>
                </div>
            ) : localRooms.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-muted)]">
                    <p className="text-lg mb-2">📭</p>
                    <p>Aucune salle disponible.</p>
                    <p className="text-sm mt-2">Créez-en une pour commencer !</p>
                </div>
            ) : (
                <div className="relative">
                    <ul className="flex flex-col gap-3 max-h-[50vh] sm:max-h-[300px] overflow-y-auto pr-2 -mr-2">
                        {filteredRooms.map((room) => (
                            <li
                                key={room}
                                className="group p-4 rounded-xl bg-[var(--background-light)] shadow-md hover:shadow-lg hover:bg-[var(--background-dark)] transition-all border border-transparent hover:border-[var(--accent)]/30"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div
                                        className="font-semibold text-base sm:text-lg truncate cursor-pointer"
                                        style={{ color: "var(--accent)" }}
                                        onClick={() => router.push(`/rooms/${room}`)}
                                    >
                                        <span className="opacity-60">#</span> {decodeRoomName(room)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => toggleNotification(e, room)}
                                            className={`p-2 rounded-full transition-colors ${notifications[room] ? "text-[var(--accent)] bg-[var(--accent)]/10" : "text-gray-400 hover:text-[var(--accent)]"}`}
                                            title={notifications[room] ? "Désactiver notifications" : "Activer notifications"}
                                        >
                                            {notifications[room] ? (
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                </svg>
                                            )}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteRoom(room);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 p-1 text-xl"
                                            title="Masquer"
                                        >
                                            ×
                                        </button>
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent)] text-sm">
                                            →
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                </div>
            )}

            {!loading && localRooms.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[var(--accent)]/20 text-center text-sm text-[var(--accent)]">
                    {localRooms.length} salle{localRooms.length > 1 ? 's' : ''} disponible{localRooms.length > 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
};

export default ChannelList;
