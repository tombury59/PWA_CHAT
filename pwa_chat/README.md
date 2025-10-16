# PWA Chat

Application de chat moderne développée avec **Next.js**, **React**, **TypeScript** et **Tailwind CSS**. Fonctionne comme une Progressive Web App (PWA) : échange de messages, envoi de photos, galerie utilisateur, notifications et expérience optimisée sur tous les appareils.

## Fonctionnalités

- Authentification rapide (pseudo + photo)
- Liste des salons de discussion (channels)
- Chat en temps réel (mocké, prêt pour WebSocket)
- Envoi et capture de photos (galerie personnelle)
- Notifications natives
- Interface responsive et moderne

## Technologies

- Next.js (App Router)
- React
- TypeScript & JavaScript
- Tailwind CSS
- Socket.io (préparé pour le temps réel)
- PWA (manifest, service worker)
- npm

## Installation

Clone le repo :

```bash
git clone https://github.com/tombury59/PWA_CHAT.git
cd PWA_CHAT/pwa_chat
```
Installe les dépendances :

```bash
npm install
```

Démarre le serveur de développement :

```bash
npm run dev
```


Dernière avancé:
- integration de la galerie photo
- récuperation des channels depuis le serveur

A faire:
- créeation d'un channel => https://api.tools.gavago.fr/socketio/chat/test
- intégration WebSocket (Socket.io)
- amélioration UI/UX
