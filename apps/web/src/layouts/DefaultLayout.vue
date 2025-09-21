<script lang="ts" setup>
import { AppFooter, AppNavbar } from './components';

// If you localize later, this mirrors NuxSaaS i18n head behavior
// const i18nHead = useLocaleHead()
// useHead(() => ({
//   // link: [...(i18nHead?.value.link || [])]
// }));
</script>

<template>
  <div class="min-h-screen flex flex-col items-center relative bg-base-100 text-base-content">
    <AppNavbar>
      <template #center>
        <slot name="nav-center" />
      </template>
      <template #right>
        <slot name="nav-right" />
      </template>
    </AppNavbar>

    <div class="flex flex-1 pt-16 w-full sm:w-auto">
      <slot />
    </div>

    <AppFooter />
  </div>
</template>