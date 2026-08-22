# ==========================================
# 1. Base Image & Dependencies
# ==========================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat git

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# ==========================================
# 2. Builder Stage
# ==========================================
FROM node:20-alpine AS builder
RUN apk add --no-cache git

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Railway builds don't include .git, so the Breads-Shared submodule is left empty.
# Clone it directly instead (public repo, no auth needed).
RUN rm -rf src/Breads-Shared && \
    git clone --depth 1 https://github.com/NguyenAnhDuc1711/Breads-Shared.git src/Breads-Shared

# Build-time argument for Next.js (NEXT_PUBLIC_* must be present at build time)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_GA_ID

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_GA_ID=${NEXT_PUBLIC_GA_ID}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ==========================================
# 3. Production Runner Stage
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets and standalone server build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
