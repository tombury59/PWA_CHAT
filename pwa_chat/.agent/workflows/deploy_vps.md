---
description: Deploy PWA Chat to VPS using Docker
---

# Déploiement sur VPS (Docker)

Cette procédure explique comment déployer l'application PWA Chat sur votre VPS.

## Prérequis sur le VPS
- Docker
- Docker Compose
- Git (si vous utilisez git)

## Étapes

1. **Préparer le VPS**
   Connectez-vous à votre VPS :
   ```bash
   ssh user@votre-ip
   ```

2. **Récupérer le code**
   Clonez votre dépôt ou copiez les fichiers du projet.
   ```bash
   git clone <votre-repo-url> pwa-chat
   cd pwa-chat
   ```

3. **Lancer l'application**
   Construisez et lancez le conteneur :
   ```bash
   docker-compose up -d --build
   ```

4. **Vérification**
   Vérifiez que le conteneur tourne :
   ```bash
   docker ps
   ```
   L'application devrait être accessible sur `http://localhost:3000` (ou l'IP de votre VPS sur le port 3000 si le pare-feu le permet).

## Configuration HTTPS (Obligatoire pour PWA)

Pour que la PWA (Service Workers, Caméra, etc.) fonctionne, vous **DEVEZ** être en HTTPS.
Il est recommandé d'utiliser un reverse proxy comme Nginx ou Traefik devant le conteneur Docker.

### Exemple Nginx (Simplifié)
Si vous avez Nginx installé sur le VPS :
1. Créez un bloc serveur pointant vers `http://localhost:3000`.
2. Utilisez Certbot pour générer le SSL.

```nginx
server {
    server_name votre-domaine.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```
