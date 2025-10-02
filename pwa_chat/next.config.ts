import withPWA from "next-pwa";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // autres options Next.js ici
};

export default withPWA({
    ...nextConfig,
    pwa: {
        dest: "public",
        register: true,
        skipWaiting: true,
    },
});
