# ============================================
# FaOnSisT - Multi-stage Docker Build
# Next.js 16 + Prisma 7 + PostgreSQL
# ============================================

# -------------------------------------------
# Stage 1: Install dependencies
# -------------------------------------------
FROM node:22-alpine AS deps

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm ci --ignore-scripts && \
    npx prisma generate

# -------------------------------------------
# Stage 2: Build the Next.js application
# -------------------------------------------
FROM node:22-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npx prisma generate && npm run build

# -------------------------------------------
# Stage 3: Production runner
# -------------------------------------------
FROM node:22-alpine AS runner

RUN apk add --no-cache libc6-compat openssl curl

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma files for migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Copy package.json for prisma seed script reference
COPY --from=builder /app/package.json ./package.json

# Create uploads and logs directories with correct permissions
RUN mkdir -p /app/uploads /app/logs && \
    chown -R nextjs:nodejs /app

# Create entrypoint script
COPY <<'EOF' /app/entrypoint.sh
#!/bin/sh
set -e

echo "==> Running Prisma migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

echo "==> Starting FaOnSisT server..."
exec node server.js
EOF

RUN chmod +x /app/entrypoint.sh && chown nextjs:nodejs /app/entrypoint.sh

USER nextjs

EXPOSE 3000

# Docker healthcheck — container sagligini izle
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["/app/entrypoint.sh"]
