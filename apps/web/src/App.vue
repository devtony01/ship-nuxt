<script setup lang="ts">
import { Toaster } from 'vue-sonner'

// Import user handler to set up global event listeners
import './resources/user/user.handler'
</script>

<template>
  <div>
    <RouterView />
    <Toaster
      rich-colors
      position="top-right"
      :toast-options="{ duration: 4000 }"
      expand
    />
  </div>
</template>

<style>
/* Set the theme on the html element */
html {
  data-theme: cyberpunk;
}
</style>