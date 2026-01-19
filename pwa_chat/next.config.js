const runtimeCaching = require('next-pwa/cache');

const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    runtimeCaching: [
        ...runtimeCaching,
        {
            urlPattern: /^https:\/\/api\.tools\.gavago\.fr\/socketio\/tchat\/api\/images\/.*$/,
            handler: 'CacheFirst',
            options: {
                cacheName: 'chat-images',
                expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
                },
            },
        }
    ]
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    reactStrictMode: true,
    swcMinify: true,
    experimental: {
        appDir: true
    }
};

module.exports = withPWA(nextConfig);
