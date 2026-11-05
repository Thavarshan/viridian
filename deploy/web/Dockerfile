FROM node:24-bookworm-slim AS build

WORKDIR /workspace

RUN apt-get update \
  && apt-get install --no-install-recommends -y python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY apps/web/package.json apps/web/package-lock.json ./apps/web/
RUN npm ci --prefix apps/web

COPY tsconfig.base.json ./tsconfig.base.json
COPY apps/web ./apps/web
WORKDIR /workspace/apps/web

# Code generation and Vite's production build boot the app. These placeholders
# satisfy startup validation only in this build command; runtime settings are
# supplied by the deployment environment below.
RUN export NODE_ENV=production \
  PORT=3333 \
  HOST=0.0.0.0 \
  LOG_LEVEL=info \
  APP_KEY=01234567890123456789012345678901 \
  APP_URL=http://127.0.0.1:3333 \
  DB_HOST=127.0.0.1 \
  DB_PORT=5432 \
  DB_USER=build \
  DB_PASSWORD=build \
  DB_DATABASE=build \
  SESSION_DRIVER=memory \
  MAIL_MAILER=smtp \
  MAIL_FROM_NAME=Wire \
  MAIL_FROM_ADDRESS=noreply@example.test \
  SMTP_HOST=127.0.0.1 \
  SMTP_PORT=1025 \
  && node ace codegen \
  && npm run build

FROM node:24-bookworm-slim AS production-dependencies

WORKDIR /app

RUN apt-get update \
  && apt-get install --no-install-recommends -y python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /workspace/apps/web/build/package.json ./package.json
COPY --from=build /workspace/apps/web/build/package-lock.json ./package-lock.json
RUN npm ci --omit=dev

FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333

WORKDIR /app

RUN apt-get update \
  && apt-get install --no-install-recommends -y libstdc++6 \
  && rm -rf /var/lib/apt/lists/*

COPY --from=production-dependencies --chown=node:node \
  /app/node_modules ./node_modules
COPY --from=build --chown=node:node /workspace/apps/web/build/ ./

USER node

EXPOSE 3333

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3333/health').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "bin/server.js"]
