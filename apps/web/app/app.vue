<template>
  <div>
    <NuxtLoadingIndicator />
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <Toaster
      rich-colors
      position="top-right"
      :toast-options="{ duration: 4000 }"
      expand
    />
  </div>
</template>