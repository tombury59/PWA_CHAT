import { useRouter } from "next/navigation";
import React from "react";

const Logout: React.FC = () => {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("userName");
        localStorage.removeItem("userPhoto");
        localStorage.removeItem("userGalleryPhotos"); // Ajout pour reset la galerie
        router.replace("/");
    };

    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--background)] font-bold shadow hover:bg-[var(--accent-light)] transition"
        >
            Déconnexion
        </button>
    );
};

export default Logout;
