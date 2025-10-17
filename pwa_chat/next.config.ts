import withPWA from "next-pwa";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    env: {
        SOCKET_URL: process.env.SOCKET_URL || 'https://api.tools.gavago.fr',
    },
};

const withPWAConfig = withPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    swSrc: './public/worker.js',
    runtimeCaching: [
            {
                urlPattern: /^https:\/\/api\.tools\.gavago\.fr\/.*$/,
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'api-cache',
                    expiration: {
                        maxEntries: 32,
                        maxAgeSeconds: 24 * 60 * 60 // 24 heures
                    }
                }
            },
            {
                urlPattern: /\/_next\/image\?url=.+$/i,
                handler: 'CacheFirst',
                options: {
                    cacheName: 'image-cache',
                    expiration: {
                        maxEntries: 50,
                        maxAgeSeconds: 7 * 24 * 60 * 60 // 7 jours
                    }
                }
            },
            {
                urlPattern: /\.(png|jpg|jpeg|svg|gif|ico|webp)$/,
                handler: 'CacheFirst',
                options: {
                    cacheName: 'static-image-assets',
                    expiration: {
                        maxEntries: 64,
                        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 jours
                    }
                }
            }
        ]
});

export default {
    ...nextConfig,
    ...withPWAConfig
};
