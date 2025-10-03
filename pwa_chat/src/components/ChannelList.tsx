import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ChannelList: React.FC = () => {
    const [rooms, setRooms] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch("https://api.tools.gavago.fr/socketio/api/rooms")
            .then(res => res.json())
            .then(json => {
                const parsed = JSON.parse(json.data);
                setRooms(parsed);
            })
            .catch(() => setRooms([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-[var(--primary)] rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--accent)" }}>Salles de discussion</h2>
            {loading ? (
                <div className="text-[var(--text-muted)]">Chargement…</div>
            ) : (
                <ul className="flex flex-col gap-4 max-h-[350px] overflow-y-auto">
                    {rooms.map(room => (
                        <li
                            key={room}
                            className="p-4 rounded-xl bg-[var(--background-light)] shadow hover:bg-[var(--background-dark)] transition cursor-pointer"
                            style={{ minHeight: "56px", display: "flex", alignItems: "center" }} // Hauteur standardisée
                            onClick={() => router.push(`/rooms/${room}`)}
                        >
                            <div
                                className="font-semibold text-lg"
                                style={{
                                    color: "var(--accent)",
                                    maxWidth: "400px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                # {room}
                            </div>
                        </li>
                    ))}
                    {rooms.length === 0 && (
                        <div className="text-[var(--text-muted)]">Aucune salle disponible.</div>
                    )}
                </ul>
            )}
        </div>
    );
};

export default ChannelList;
