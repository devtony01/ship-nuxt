<script setup lang="ts">
import { Features, Hero } from './components'

definePageMeta({
  alias: ['/'],
})

</script>

<template>
  <NuxtLayout name="default">
    <div class="w-full">
      <Hero />
      <Features />
    </div>
  </NuxtLayout>
</template>
