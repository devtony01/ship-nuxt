<script setup lang="ts">
// Unauthorized layout adapted from my-ship-app: split image + centered content.
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2">
    <!-- Left: Illustration (visible from sm and up) -->
    <div class="hidden sm:block h-screen">
      <img src="/images/ship.svg" alt="App Info" class="h-full w-full object-cover">
    </div>

    <!-- Right: Centered content -->
    <main
      class="flex h-screen w-full items-center justify-center px-8 bg-base-100 text-base-content"
    >
      <slot />
    </main>
  </div>
</template>
