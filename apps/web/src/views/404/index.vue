<script setup lang="ts">
import { useRouter } from 'vue-router'

import UnauthorizedLayout from 'layouts/UnauthorizedLayout.vue'

const router = useRouter()

// SEO meta would be handled by vue-meta or similar
// useSeoMeta({
//   title: '404 - Page Not Found',
//   ogTitle: '404 - Page Not Found',
//   description: 'The page you are looking for does not exist.',
//   ogDescription: 'The page you are looking for does not exist.',
// })
</script>

<template>
  <UnauthorizedLayout>
    <div
      class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div class="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 class="text-9xl font-bold text-gray-300">
            404
          </h1>
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
            Page not found
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>
        <div class="mt-8 space-y-4">
          <RouterLink
            to="/"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Go back home
          </RouterLink>
          <button
            class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            @click="router.go(-1)"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  </UnauthorizedLayout>
</template>
