"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

    const filteredRooms = localRooms.filter(room =>
        decodeRoomName(room).toLowerCase().includes(newRoom.toLowerCase())
    );

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
