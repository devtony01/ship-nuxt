// plugins/vue-sonner.ts
import { toast,Toaster } from 'vue-sonner';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('Toaster', Toaster);
  // Make toast available globally
  nuxtApp.provide('toast', toast);
});