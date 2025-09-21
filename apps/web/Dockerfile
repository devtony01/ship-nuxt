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

# Build arguments for environment variables
ARG APP_ENV=production
ARG API_URL=https://api.ship-nuxt.dedyn.io
ARG WS_URL=https://api.ship-nuxt.dedyn.io
ARG WEB_URL=https://ship-nuxt.dedyn.io
ARG MIXPANEL_API_KEY

# Set environment variables for Vite build
ENV VITE_APP_ENV=$APP_ENV
ENV VITE_API_URL=$API_URL
ENV VITE_WS_URL=$WS_URL
ENV VITE_WEB_URL=$WEB_URL
ENV VITE_MIXPANEL_API_KEY=$MIXPANEL_API_KEY

RUN pnpm turbo run build --filter=web...

# RUNNER - Stage 5
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built Vue app from builder stage
COPY --from=app_builder /app/apps/web/dist .

# Copy nginx configuration
COPY --from=app_builder /app/apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]