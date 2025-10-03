// pwa_chat/src/components/Loader.tsx
const Loader = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[var(--accent)] border-b-4 border-[var(--primary)]"></div>
    </div>
);

export default Loader;
