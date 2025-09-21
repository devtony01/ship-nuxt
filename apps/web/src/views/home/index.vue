<script setup lang="ts">
import { Features, Hero } from './components'

import DefaultLayout from 'layouts/DefaultLayout.vue'

// SEO meta (would be handled by vue-meta or similar in a real app)
// useSeoMeta({
//   title: 'Home',
//   ogTitle: 'Home',
//   description: 'Welcome to Ship Vue',
//   ogDescription: 'Welcome to Ship Vue',
// })
</script>

<template>
  <DefaultLayout>
    <div class="w-full">
      <Hero />
      <Features />
    </div>
  </DefaultLayout>
</template>
