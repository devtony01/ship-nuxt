import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/home/index.vue'),
    },
    {
      path: '/sign-in',
      name: 'sign-in',
      component: () => import('../views/sign-in/index.vue'),
    },
    {
      path: '/sign-up',
      name: 'sign-up',
      component: () => import('../views/sign-up/index.vue'),
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/forgot-password/index.vue'),
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/reset-password/index.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/profile/index.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/dashboard/index.vue'),
    },
    {
      path: '/404',
      name: '404',
      component: () => import('../views/404/index.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404'
    }
  ],
})

export default router