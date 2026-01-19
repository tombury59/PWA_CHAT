---
description: Deploy PWA Chat to VPS using GitHub Actions
---

# Déploiement sur VPS (Via GitHub Actions)

Le déploiement est désormais automatisé via GitHub Actions, remplaçant l'ancienne méthode Docker.

## Prérequis sur le VPS
- **Node.js**: Installé
- **PM2**: Installé globalement (`npm install -g pm2`)
- **Dossier**: `/var/Chat-PWA/nexttalk` (ou le chemin configuré dans le workflow) doit exister et être un dépôt git cloné.

## Configuration GitHub
Le fichier `.github/workflows/deploy-nexttalk.yml` gère le déploiement.

### Secrets Requis
Configurez ces secrets dans votre dépôt GitHub :
- `VPS_HOST`: Adresse IP du VPS
- `VPS_USERNAME`: Nom d'utilisateur (ex: root ou user)
- `VPS_SSH_KEY`: Clé privée SSH pour l'accès sans mot de passe

## Fonctionnement
- À chaque `push` sur la branche `main` (modifiant le dossier `pwa_chat` ou le workflow), l'action se lance.
- Elle se connecte au VPS, pull les changements, installe les dépendances, build et redémarre l'application via PM2.

Pour déclencher manuellement :
1. Allez dans l'onglet **Actions** sur GitHub.
2. Sélectionnez "Deploy NextTalk to VPS".
3. Cliquez sur "Run workflow".
