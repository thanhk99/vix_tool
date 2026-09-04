# ==============================================================================
# 1. BASE IMAGE
# ==============================================================================
FROM node:20-slim AS base

# ==============================================================================
# 2. DEPENDENCIES STAGE (Install packages)
# ==============================================================================
FROM base AS deps
WORKDIR /app

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

COPY package.json package-lock.json* ./
RUN npm config set strict-ssl false && npm ci

# ==============================================================================
# 3. BUILD STAGE (Compile Next.js standalone application)
# ==============================================================================
FROM base AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for frontend public variables
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# ==============================================================================
# 4. RUNNER STAGE (Minimal production runtime)
# ==============================================================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 -g nodejs nextjs

COPY --from=builder /app/public ./public

# Set correct permissions for prerender cache
RUN mkdir .next && \
    chown nextjs:nodejs .next

# Copy standalone output and static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
