# Étape 1 : Installation des dépendances
FROM node:20-alpine AS deps
WORKDIR /app
# On copie les fichiers de conf du sous-dossier
COPY pwa_chat/package.json pwa_chat/package-lock.json ./
RUN npm ci

# Étape 2 : Construction de l'application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# On copie tout le contenu du sous-dossier
COPY pwa_chat/ .

# Activation du mode standalone dans le build
ENV NEXT_PRIVATE_STANDALONE true
RUN npm run build

# Étape 3 : Runner de production (image finale légère)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# Désactiver la télémétrie Next.js pendant l'exécution
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Récupération du build standalone et des assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Votre app utilise le port 8080 selon votre package.json
EXPOSE 8080
ENV PORT 8080
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]