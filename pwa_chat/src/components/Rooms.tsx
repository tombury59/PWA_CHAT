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
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [geoError, setGeoError] = useState<string | null>(null);
    const [loadingLoc, setLoadingLoc] = useState(false);
    const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
    const [isCharging, setIsCharging] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const name = localStorage.getItem("userName") || "Moi";
        const avatarRaw = localStorage.getItem("userPhoto");
        const avatar = normalizeAvatar(avatarRaw);
        setUser({ name, avatar });

        const locRaw = localStorage.getItem("userLocation");
        if (locRaw) {
            try {
                setLocation(JSON.parse(locRaw));
            } catch { }
        }

        // Battery API
        if ('getBattery' in navigator) {
            (navigator as any).getBattery().then((battery: any) => {
                setBatteryLevel(Math.round(battery.level * 100));
                setIsCharging(battery.charging);

                battery.addEventListener('levelchange', () => {
                    setBatteryLevel(Math.round(battery.level * 100));
                });
                battery.addEventListener('chargingchange', () => {
                    setIsCharging(battery.charging);
                });
            }).catch(() => {
                // Battery API not supported
            });
        }
    }, []);

    const getLocation = () => {
        if (!navigator.geolocation) {
            setGeoError("Non supporté");
            return;
        }
        setLoadingLoc(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const loc = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setLocation(loc);
                localStorage.setItem("userLocation", JSON.stringify(loc));
                setGeoError(null);
                setLoadingLoc(false);
            },
            (error) => {
                console.error(error);
                setGeoError("Erreur position");
                setLoadingLoc(false);
            }
        );
    };

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

                            <div className="p-4 border-t border-[var(--primary-light)] border-b">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-[var(--accent)] text-sm">📍 Localisation</span>
                                    <button
                                        onClick={getLocation}
                                        disabled={loadingLoc}
                                        className="text-xs bg-[var(--accent)] text-[var(--background)] px-2 py-1 rounded hover:opacity-80 disabled:opacity-50"
                                    >
                                        {loadingLoc ? "..." : (location ? "Actualiser" : "Activer")}
                                    </button>
                                </div>
                                {geoError && <p className="text-xs text-red-400 mb-1">{geoError}</p>}
                                {location ? (
                                    <div className="mt-2 w-full h-32 rounded-lg overflow-hidden border border-[var(--gray-border)] relative bg-gray-100">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            scrolling="no"
                                            marginHeight={0}
                                            marginWidth={0}
                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.001}%2C${location.lat - 0.001}%2C${location.lng + 0.001}%2C${location.lat + 0.001}&layer=mapnik&marker=${location.lat}%2C${location.lng}`}
                                            title="Ma position"
                                        ></iframe>
                                    </div>
                                ) : (
                                    <p className="text-xs text-[var(--text-secondary)] italic">Non définie</p>
                                )}
                            </div>

                            {batteryLevel !== null && (
                                <div className="p-4 border-t border-[var(--primary-light)] border-b">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-[var(--accent)] text-sm">
                                            🔋 Batterie
                                        </span>
                                        <span className="text-sm text-[var(--text-secondary)]">
                                            {batteryLevel}% {isCharging && '⚡'}
                                        </span>
                                    </div>
                                    <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${batteryLevel > 50 ? 'bg-green-500' :
                                                    batteryLevel > 20 ? 'bg-yellow-500' :
                                                        'bg-red-500'
                                                }`}
                                            style={{ width: `${batteryLevel}%` }}
                                        />
                                    </div>
                                </div>
                            )}

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
