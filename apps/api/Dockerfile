# BUILDER - Stage 1
FROM node:22-alpine AS builder
WORKDIR /app
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk update && apk add --no-cache libc6-compat
RUN npm install --global --no-update-notifier --no-fund turbo@2.5.4
COPY . .
RUN turbo prune --scope=api --docker

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
CMD pnpm turbo run dev --filter=api

# MIGRATOR - Stage 4 (for running migrations)
FROM installer AS migrator
WORKDIR /app
# Install ts-node for running TypeScript migrator
RUN npm install --global --no-update-notifier --no-fund ts-node@10.9.2
CMD ["ts-node", "--transpile-only", "apps/api/src/migrator.ts"]

# GENERATOR - Stage 5 (for generating migrations)
FROM installer AS generator
WORKDIR /app
# Install drizzle-kit globally for generation
RUN npm install --global --no-update-notifier --no-fund drizzle-kit@0.28.1
# Create generation script
RUN echo '#!/bin/sh\nset -e\necho "📝 Generating database migrations..."\ncd apps/api\ndrizzle-kit generate\necho "✅ Database migrations generated!"' > /usr/local/bin/generate.sh
RUN chmod +x /usr/local/bin/generate.sh
CMD ["/usr/local/bin/generate.sh"]

# RUNNER - Stage 6 (production app)
FROM node:22-alpine AS runner
WORKDIR /app
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk update && apk add --no-cache libc6-compat
RUN npm install --global --no-update-notifier --no-fund ts-node@10.9.2 drizzle-kit@0.28.1

# Don't run production as root
RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app

COPY --from=installer /app .

# Create migration script for production use
RUN echo '#!/bin/sh\nset -e\necho "🔄 Running database migrations..."\nts-node apps/api/src/migrator.ts\necho "✅ Database migrations completed!"' > /usr/local/bin/migrate.sh
RUN chmod +x /usr/local/bin/migrate.sh

# Create generation script for production use
RUN echo '#!/bin/sh\nset -e\necho "📝 Generating database migrations..."\ncd apps/api\ndrizzle-kit generate\necho "✅ Database migrations generated!"' > /usr/local/bin/generate.sh
RUN chmod +x /usr/local/bin/generate.sh

# Create startup script that can run migrations before starting the app
RUN echo '#!/bin/sh\nset -e\nif [ "$RUN_MIGRATIONS" = "true" ]; then\n  echo "🔄 Running database migrations on startup..."\n  /usr/local/bin/migrate.sh\nfi\necho "🚀 Starting API server..."\nexec ts-node apps/api/src/app.ts' > /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

USER app

EXPOSE 3001

CMD ["/usr/local/bin/start.sh"]