"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "https://api.tools.gavago.fr/socketio/api/rooms";

const ChannelList: React.FC = () => {
    const [rooms, setRooms] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const parseRoomsResponse = (json: any): string[] => {
        if (!json) return [];

        // Cas où la réponse contient un objet `data` mappant roomName -> { clients: {...} }
        if (json.data && typeof json.data === "object" && !Array.isArray(json.data)) {
            return Object.keys(json.data);
        }

        // Cas où `data` est une string sérialisée
        if (json.data && typeof json.data === "string") {
            try {
                const parsed = JSON.parse(json.data);
                if (Array.isArray(parsed)) return parsed.map(String);
                if (typeof parsed === "object" && parsed !== null) return Object.keys(parsed);
            } catch (e) {
                // ignore et fallback
            }
        }

        // Cas où la réponse est directement un tableau
        if (Array.isArray(json)) return json.map(String);

        // Cas où rooms est présent
        if (Array.isArray(json.rooms)) return json.rooms.map(String);

        // Fallback : tenter d'extraire des clés d'un objet racine
        if (typeof json === "object" && json !== null) {
            return Object.keys(json);
        }

        return [];
    };

    const fetchRooms = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(API_URL, { cache: "no-store" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            console.debug("Rooms API response:", json);
            const parsed = parseRoomsResponse(json);
            setRooms(parsed);
        } catch (err: any) {
            console.error("Erreur fetchRooms:", err);
            setError(err?.message ?? String(err));
            setRooms([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    return (
        <div className="bg-[var(--primary)] rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
                    Salles de discussion
                </h2>
                <button
                    onClick={fetchRooms}
                    className="text-sm px-3 py-1 rounded bg-[var(--accent)] text-[var(--background)]"
                >
                    Rafraîchir
                </button>
            </div>

            {loading ? (
                <div className="text-[var(--text-muted)]">Chargement…</div>
            ) : (
                <>
                    {error && <div className="text-sm text-red-400 mb-4">Erreur: {error}</div>}

                    {rooms.length === 0 ? (
                        <div className="text-[var(--text-muted)]">Aucune salle disponible.</div>
                    ) : (
                        <ul className="flex flex-col gap-4 max-h-[350px] overflow-y-auto">
                            {rooms.map((room) => (
                                <li
                                    key={room}
                                    className="p-4 rounded-xl bg-[var(--background-light)] shadow hover:bg-[var(--background-dark)] transition cursor-pointer"
                                    style={{ minHeight: "56px", display: "flex", alignItems: "center" }}
                                    onClick={() => router.push(`/rooms/${encodeURIComponent(room)}`)}
                                >
                                    <div
                                        className="font-semibold text-lg truncate"
                                        style={{
                                            color: "var(--accent)",
                                            maxWidth: "100%",
                                        }}
                                    >
                                        # {room}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </div>
    );
};

export default ChannelList;
