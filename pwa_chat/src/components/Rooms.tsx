import React from "react";

interface Room {
    id: number;
    name: string;
    description: string;
}

const mockRooms: Room[] = [
    { id: 1, name: "Général", description: "Discussion générale" },
    { id: 2, name: "Tech", description: "Tech & dev" },
    { id: 3, name: "Fun", description: "Blagues et détente" }
];

const Rooms: React.FC = () => (
    <div className="max-w-lg mx-auto mt-12 p-8 rounded-2xl shadow-2xl bg-[var(--primary)] text-[var(--foreground)]">
        <h2 className="text-3xl font-bold mb-6" style={{ color: "var(--accent)" }}>
            Salles de discussion
        </h2>
        <ul className="space-y-4">
            {mockRooms.map(room => (
                <li key={room.id} className="p-4 rounded-xl bg-[var(--background-light)] shadow hover:bg-[var(--background-dark)] transition">
                    <div className="font-semibold text-lg" style={{ color: "var(--accent)" }}>{room.name}</div>
                    <div className="text-sm text-[var(--text-muted)]">{room.description}</div>
                </li>
            ))}
        </ul>
    </div>
);

export default Rooms;
