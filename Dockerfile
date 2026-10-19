# WebForge on alex. Build: docker compose build. Run: docker compose up -d.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3100
RUN addgroup -S webforge && adduser -S webforge -G webforge
COPY --from=build --chown=webforge:webforge /app/.next/standalone ./
COPY --from=build --chown=webforge:webforge /app/.next/static ./.next/static
COPY --from=build --chown=webforge:webforge /app/public ./public
COPY --from=build --chown=webforge:webforge /app/library ./library
RUN mkdir -p /app/data && chown webforge:webforge /app/data
USER webforge
EXPOSE 3100
CMD ["node", "server.js"]
