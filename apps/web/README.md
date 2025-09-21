# Vue 3 Web App

A modern Vue 3 application built with Vite, TypeScript, Tailwind CSS, and DaisyUI.

## Features

- ⚡️ Vue 3 with Composition API
- 🚀 Vite for fast development and building
- 📦 TypeScript for type safety
- 🎨 Tailwind CSS + DaisyUI for styling
- 🔄 Vue Query for data fetching
- 📋 Form validation with vee-validate + zod
- 🔐 Authentication flow
- 🌐 Socket.io integration
- 📊 Analytics with Mixpanel
- 🐳 Docker support

## Setup

Make sure to install dependencies:

```bash
# pnpm (recommended)
pnpm install

# npm
npm install

# yarn
yarn install
```

## Development Server

Start the development server on `http://localhost:3002`:

```bash
# pnpm
pnpm dev

# npm
npm run dev

# yarn
yarn dev
```

## Production

Build the application for production:

```bash
# pnpm
pnpm build

# npm
npm run build

# yarn
yarn build
```

Locally preview production build:

```bash
# pnpm
pnpm preview

# npm
npm run preview

# yarn
yarn preview
```

## Docker

### Development

```bash
docker build --target development -t web-dev .
docker run -p 3002:3002 web-dev
```

### Production

```bash
docker build --target runner -t web-prod .
docker run -p 80:80 web-prod
```

## Environment Variables

Copy `.env` and configure your environment variables:

```bash
cp .env .env.local
```

Required variables:

- `VITE_API_URL` - Backend API URL
- `VITE_WS_URL` - WebSocket URL
- `VITE_WEB_URL` - Frontend URL
- `VITE_MIXPANEL_API_KEY` - Mixpanel API key (optional)

## Project Structure

```
src/
├── assets/          # Static assets
├── components/      # Reusable components
├── config/          # Configuration files
├── layouts/         # Layout components
├── resources/       # API resources
├── router/          # Vue Router configuration
├── services/        # Business logic services
├── stores/          # Pinia stores
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── views/           # Page components
└── main.ts          # Application entry point
```

## Tech Stack

- **Framework**: Vue 3
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + DaisyUI
- **State Management**: Pinia + Vue Query
- **Routing**: Vue Router
- **Forms**: vee-validate + zod
- **HTTP Client**: Axios
- **WebSockets**: Socket.io
- **Analytics**: Mixpanel
- **Testing**: Vitest + Playwright
