# PWA Chat

Application de chat moderne développée avec **Next.js**, **React**, **TypeScript** et **Tailwind CSS**. Fonctionne comme une Progressive Web App (PWA) : échange de messages, envoi de photos, galerie utilisateur, notifications et expérience optimisée sur tous les appareils.

## Fonctionnalités

- Authentification rapide (pseudo + photo)
- Liste des salons de discussion (channels)
- Chat en temps réel (préparé pour Socket.io / WebSocket)
- Envoi et capture de photos (galerie personnelle)
- Notifications natives
- Interface responsive et moderne
- Tests automatisés (unitaires / petits tests d'intégration)

## Technologies

- Next.js (App Router)
- React
- TypeScript & JavaScript
- Tailwind CSS
- Socket.io (préparé pour le temps réel)
- PWA (manifest, service worker)
- npm
- Vitest + React Testing Library pour les tests

## Installation

Clone le repo :

```bash
git clone https://github.com/tombury59/PWA_CHAT.git
cd PWA_CHAT/pwa_chat
```

Installe les dépendances :

```bash
npm install
```

Démarre le serveur de développement :

```bash
npm run dev
```

## Tests

Type de tests inclus dans le projet :

- Tests unitaires
- Petits tests d'intégration locaux
- Tests de composants

### Exemples

- Unitaire: `src/__tests__/__lib__/offline-sync.test.ts`  
  utilitaire localStorage / offline sync.

- Unitaire: `src/__tests__/__lib__/socket.test.ts`  
  test avec mock de socket.io-client pour l'import/configuration du module socket.

- Composant: `src/__tests__/components/PhotoCapture.test.tsx`
  test du composant de capture photo ( démarrage caméra, apercu, suppresion)
- Configuration de test et setup dans `test/setup.ts`.

### Commandes

```bash
# lancer la suite de tests (Vitest)
npm run test

# lancer en mode watch (Vitest)
npx vitest --watch
```

## Structure importante

- `src/lib/socket.ts`  
  logique de socket (préparé pour Socket.io).

- `src/contexts/SocketContext.tsx`  
  contexte React pour le socket.

- `src/hooks/useLocalStorage.ts`  
  hook localStorage (testé).

- `src/__tests__/`  
  tests du projet.

- `test/setup.ts`  
  setup global des tests.

## Notes de développement

- Les tests mockent les dépendances externes (ex. socket.io-client) pour exécuter des unités isolées sans serveur réel.
- Pour ajouter des tests e2e, créer un dossier séparé `e2e/` et utiliser un outil dédié (Cypress / Playwright).
- Si CORS pose problème en local, préférer une configuration serveur ou un proxy de développement plutôt qu'une extension navigateur en production.

