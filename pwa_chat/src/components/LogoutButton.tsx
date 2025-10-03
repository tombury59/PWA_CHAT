// pwa_chat/src/components/LogoutButton.tsx
import React from "react";

const LogoutButton: React.FC = () => {
    const handleLogout = () => {
        localStorage.removeItem("userName");
        localStorage.removeItem("userPhoto");
        window.location.reload();
    };

    return (
        <button
            onClick={handleLogout}
            className="mt-8 px-6 py-3 rounded-xl font-bold bg-[var(--error)] text-[var(--text-on-accent)] shadow-lg hover:bg-[var(--accent-dark)] transition"
        >
            Se déconnecter
        </button>
    );
};

export default LogoutButton;
