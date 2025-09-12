// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config';

import tailwindcss from '@tailwindcss/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],
  css: ['~/assets/app.css'],
  vite: {
    plugins: [
      tailwindcss(),
      nodePolyfills(),
    ],
    resolve: {
      alias: {
        resources: '~/resources',
        components: '~/components',
        services: '~/services',
        layouts: '~/layouts',
        config: '~/config',
        utils: '~/utils',
        'query-client': '~/query-client',
      }
    }
  },
  app: {
    head: {
      htmlAttrs: {
        'data-theme': 'cyberpunk',
      },
    },
  },
  // @ts-expect-error: eslint is a custom Nuxt module property
  eslint: {
    config: {
      standalone: false,
    },
  },
  routeRules: { '/home': { redirect: '/' } },
  $production: {
    build: {
      transpile: ['zod']
    }
  }
});