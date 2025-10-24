module.exports = {
    apps: [{
        name: 'pwa-chat',
        script: 'npm',
        args: 'start',
        cwd: '/var/www/PWA_CHAT/pwa_chat',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'production',
            PORT: 3000
        }
    }]
}
