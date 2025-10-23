import withPWA from "next-pwa";
import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development'
});

const nextConfig = {
    output: 'standalone',
    reactStrictMode: true,
    swcMinify: true
};

module.exports = withPWA(nextConfig);
