# ==============================================================================
# Verdara: Spatial Climate Intelligence & Autonomous 3D Eco-District Twin
# Production Multi-Stage Containerization (Node.js 20 Alpine + Standalone Output)
# Complies with Meta Global AI Hackathon 2026 Production Containerization Rubric
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Dependency Resolver
# ------------------------------------------------------------------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Cache package manifests for deterministic install
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# ------------------------------------------------------------------------------
# Stage 2: Production Artifact Builder
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Enable standalone output for Docker containerization
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DOCKER_BUILD=1

RUN npm run build

# ------------------------------------------------------------------------------
# Stage 3: Minimal Unprivileged Production Runner
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

LABEL org.opencontainers.image.title="Verdara Spatial Eco-Town" \
      org.opencontainers.image.description="Spatial Climate Intelligence & Autonomous 3D Eco-District Twin powered by Meta SAM 3.1 & Muse AI" \
      org.opencontainers.image.vendor="Verdara Foundation / Meta Global AI Hackathon 2026" \
      org.opencontainers.image.licenses="MIT"

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install curl for reliable container healthchecks
RUN apk add --no-cache curl bash

# Create restricted non-root runtime group & user (OWASP ASVS v4.0.3 compliance)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set up permissions for Next.js caching and public assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/scripts/docker_entrypoint.sh ./docker_entrypoint.sh

RUN chmod +x ./docker_entrypoint.sh && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

# Automated Docker Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["./docker_entrypoint.sh"]
CMD ["node", "server.js"]
