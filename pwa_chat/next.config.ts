import withPWA from "next-pwa";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    env: {
        SOCKET_URL: process.env.SOCKET_URL || 'https://api.tools.gavago.fr',
    },
};

export default withPWA({
    ...nextConfig,
    pwa: {
        dest: "public",
        register: true,
        skipWaiting: true,
        disable: process.env.NODE_ENV === 'development'
    },
});
