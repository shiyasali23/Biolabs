# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --prefer-offline --no-audit --progress=false

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Environment settings for low memory build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build with constrained memory
RUN NODE_OPTIONS="--max-old-space-size=512" npm run build

# Clean up build artifacts
RUN rm -rf .next/cache \
    && rm -rf node_modules/.cache \
    && npm prune --production

# Stage 3: Runtime
FROM node:20-alpine AS runner
WORKDIR /app

# Runtime environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=512"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built app
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
