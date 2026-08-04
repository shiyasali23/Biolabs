# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# npm install (not ci) — matches the proven build; ci fails if package.json/lock drift
RUN npm install --no-audit --progress=false

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build
RUN rm -rf .next/cache node_modules/.cache && npm prune --production

# Stage 3: Runtime (non-root)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app ./
RUN chown -R node:node /app
USER node
EXPOSE 3000
CMD ["npm", "start"]
