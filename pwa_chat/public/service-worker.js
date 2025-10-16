// public/service-worker.js

const CACHE_NAME = "pwa-chat-cache-v5"; // Increment version again
const urlsToCache = [
    "/",
    "/manifest.json",
    "/images/icons/Logo-192x192.png",
    "/images/icons/Logo-512x512.png",
    "/images/banners/desktop.png",
    "/images/banners/mobile.png"
];

// ... (install and activate events remain the same) ...
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

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


// Interception des requêtes (MODIFIED)
self.addEventListener("fetch", event => {
    // --- THIS IS THE FIX ---
    // Only handle requests for http or https schemes.
    // This will ignore chrome-extension:// requests.
    if (!event.request.url.startsWith('http')) {
        return;
    }

    // We only want to cache GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            // Return from cache or fetch from network
            return response || fetch(event.request).then(res => {
                // Add the new resource to the cache
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, res.clone());
                    return res;
                });
            });
        })
    );
});