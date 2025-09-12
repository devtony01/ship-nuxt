<script setup lang="ts">
import { AppFooter, AppNavbar } from 'layouts/components'
import { socketService } from 'services'

// Socket connection management
if (import.meta.client) {
  onMounted(() => {
    socketService.connect()
  })
  
  onUnmounted(() => {
    socketService.disconnect()
  })
}
</script>

<template>
  <div class="min-h-screen bg-base-200">
    <AppNavbar />
    <main class="pt-16">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>