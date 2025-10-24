import React, { useState, useEffect } from "react";
import ChannelList from "./ChannelList";
import UserGallery from "./UserGallery";
import Logout from "@/components/LogoutButton";

interface User {
    name: string;
    avatar: string;
}

const defaultAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=Moi";

const normalizeAvatar = (raw: string | null | undefined): string => {
    if (!raw) return defaultAvatar;
    if (raw === "null" || raw === "undefined") return defaultAvatar;

    // si c'est un JSON encodé (ex: { "uri": "..."} ou juste une string)
    try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === "string") return parsed || defaultAvatar;
        if (parsed && typeof parsed === "object") {
            return (parsed.uri || parsed.url || parsed.avatar || defaultAvatar) as string;
        }
    } catch {
        // raw n'est pas du JSON, c'est probablement une URL directe
    }

    return raw;
};

const Rooms: React.FC = () => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [user, setUser] = useState<User>({
        name: "Moi",
        avatar: defaultAvatar,
    });

    useEffect(() => {
        if (typeof window === "undefined") return;
        const name = localStorage.getItem("userName") || "Moi";
        const avatarRaw = localStorage.getItem("userPhoto");
        const avatar = normalizeAvatar(avatarRaw);
        setUser({ name, avatar });
    }, []);

    const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        (e.currentTarget as HTMLImageElement).src = defaultAvatar;
    };

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--primary)] rounded-xl flex items-center justify-center text-2xl">💬</div>
                    <h1 className="text-3xl font-bold" style={{ color: "var(--accent)" }}>PWA Chat</h1>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-2 bg-[var(--primary)] border-2 border-[var(--accent)] rounded-full px-4 py-2 cursor-pointer transition"
                    >
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full border-2"
                            style={{ borderColor: "var(--accent)" }}
                            onError={handleImgError}
                        />
                        <span className="font-semibold text-[var(--accent)]">{user.name}</span>
                        <svg className="w-4 h-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-64 bg-[var(--primary)] rounded-xl shadow-xl z-50 overflow-hidden">
                            <div className="p-4 flex items-center gap-3 bg-[var(--primary-light)]">
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-12 h-12 rounded-full border-2 shadow-sm"
                                    style={{ borderColor: "var(--accent)" }}
                                    onError={handleImgError}
                                />
                                <div className="flex flex-col">
                                    <span className="font-semibold text-[var(--accent)]">{user.name}</span>
                                    <span className="text-sm text-[var(--text-secondary)]">Mon compte</span>
                                </div>
                            </div>

                            <div className="p-3 hover:bg-[var(--primary-hover)] cursor-pointer transition-colors">
                                <Logout />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <ChannelList />
                <UserGallery />
            </div>
        </div>
    );
};

export default Rooms;
