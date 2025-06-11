# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
# Use npm install instead of npm ci to handle lock file sync issues
RUN npm install --prefer-offline --no-audit --progress=false

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Increase memory allocation for the build process
RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build

RUN rm -rf .next/cache \
    && rm -rf node_modules/.cache \
    && npm prune --production

# Stage 3: Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "start"]