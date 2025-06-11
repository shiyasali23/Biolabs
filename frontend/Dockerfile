# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies with memory optimization
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --prefer-offline --no-audit --progress=false

# Stage 2: Builder with memory optimizations
FROM node:20-alpine AS builder
WORKDIR /app

# Set Node.js memory limits and build optimizations
ENV NODE_OPTIONS="--max-old-space-size=1024"
ENV NEXT_TELEMETRY_DISABLED=1
ENV CI=1

# Copy dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build with reduced memory footprint
RUN npm run build

# Clean up build artifacts and cache
RUN rm -rf .next/cache && \
    rm -rf node_modules/.cache && \
    npm prune --production

# Stage 3: Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=512"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]