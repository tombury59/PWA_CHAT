import React from "react";

interface HomeProps {
    onStart: () => void;
}

const Home: React.FC<HomeProps> = ({ onStart }) => (
    <main className="p-8 bg-[var(--background)] text-[var(--foreground)] min-h-screen flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-4">Bienvenue sur PWA Chat</h1>
        <p className="mb-6">
            Ce projet est une Progressive Web App de chat, développée dans le cadre du Master 1 FS.
        </p>
        <h2 className="text-2xl font-semibold mb-2">Technologies utilisées :</h2>
        <ul className="list-disc pl-6 mb-6">
            <li>React & Next.js</li>
            <li>TypeScript & JavaScript</li>
            <li>Tailwind CSS</li>
            <li>PWA (Progressive Web App)</li>
            <li>npm</li>
        </ul>
        <p>
            Cette application permet d'échanger des messages, d'envoyer des photos et de profiter d'une expérience moderne sur tous les appareils.
        </p>
        <button
            className="mt-8 px-6 py-3 rounded-xl font-bold bg-[var(--accent)] text-[var(--background)] shadow-lg hover:bg-[var(--accent-light)] transition"
            onClick={onStart}
        >
            Accéder au chat
        </button>
    </main>
);

export default Home;
