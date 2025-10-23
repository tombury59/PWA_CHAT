module.exports = {
    apps: [{
        name: 'pwa-chat',
        script: 'npm',
        args: 'start',
        env: {
            NODE_ENV: 'production',
            PORT: 3001  // Port différent de Laravel
        }
    }]
};
