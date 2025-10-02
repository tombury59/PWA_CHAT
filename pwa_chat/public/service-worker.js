// public/service-worker.js

const CACHE_NAME = "pwa-chat-cache";
const urlsToCache = [
    "/",
    "/manifest.json",
    "/Logo-192x192.png",
    "/Logo-512x512.png",
    "/desktop.png",
    "/mobile.png",
    // Ajoute ici d'autres fichiers à mettre en cache
];

// Installation : mise en cache initiale
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

// Activation : nettoyage des anciens caches
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            )
        )
    );
    self.clients.claim();
});

// Interception des requêtes
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // Retourne le cache ou fait une requête réseau
            return (
                response ||
                fetch(event.request)
                    .then(res => {
                        // Ajoute la nouvelle ressource au cache
                        return caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, res.clone());
                            return res;
                        });
                    })
                    .catch(() => {
                        // Fallback offline (optionnel)
                        if (event.request.mode === "navigate") {
                            return caches.match("/");
                        }
                    })
            );
        })
    );
});
