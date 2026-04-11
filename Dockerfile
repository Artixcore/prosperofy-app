# Next.js standalone — DigitalOcean App Platform sets PORT (often 8080).
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
# NEXT_PUBLIC_* is inlined at `next build`. .dockerignore excludes .env files, so
# pass this via build args (e.g. DigitalOcean App Platform --build-arg).
ARG NEXT_PUBLIC_LARAVEL_API_BASE_URL
ENV NEXT_PUBLIC_LARAVEL_API_BASE_URL=${NEXT_PUBLIC_LARAVEL_API_BASE_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN test -n "${NEXT_PUBLIC_LARAVEL_API_BASE_URL}" || ( \
  echo >&2 "Missing build-arg NEXT_PUBLIC_LARAVEL_API_BASE_URL (Laravel origin, no /api suffix)."; \
  echo >&2 "Example: docker build --build-arg NEXT_PUBLIC_LARAVEL_API_BASE_URL=https://backend.example.com ."; \
  exit 1 \
)
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
