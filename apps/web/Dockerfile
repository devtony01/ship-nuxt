# BUILDER - Stage 1
FROM node:22-alpine AS builder
WORKDIR /app
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk update && apk add --no-cache libc6-compat
RUN npm install --global --no-update-notifier --no-fund turbo@2.5.4
COPY . .
RUN turbo prune --scope=web --docker

# INSTALLER - Stage 2
FROM node:22-alpine AS installer
WORKDIR /app
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk update && apk add --no-cache libc6-compat
RUN npm install --global --no-update-notifier --no-fund pnpm@9.5.0

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm fetch

# Build the project and its dependencies
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/out/full/ .
RUN pnpm install -r --prefer-offline --ignore-scripts
COPY --from=builder /app/out/full/turbo.json ./turbo.json

# DEVELOPMENT - Stage 3
FROM installer AS development
CMD pnpm turbo run dev --filter=web

# APP_BUILDER - Stage 4
FROM installer AS app_builder

ARG APP_ENV
ENV NUXT_PUBLIC_APP_ENV=$APP_ENV

RUN pnpm turbo run build --filter=web...

# RUNNER - Stage 5
FROM node:22-alpine AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nuxt
RUN adduser --system --uid 1001 nuxt
USER nuxt

# Copy only the built output and necessary files
COPY --from=app_builder --chown=nuxt:nuxt /app/apps/web/.output ./

EXPOSE 3002

ENV PORT=3002

CMD ["node", ".output/server/index.mjs"]