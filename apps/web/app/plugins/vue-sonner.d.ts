import { toast } from 'vue-sonner';

declare module '#app' {
  interface NuxtApp {
    $toast: typeof toast;
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $toast: typeof toast;
  }
}

export {};