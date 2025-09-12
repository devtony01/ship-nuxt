import config from "config"

export default defineNuxtRouteMiddleware(async (to) => {
  // Check if user is authenticated
  let isAuthenticated = false
  try {
    await $fetch(`${config.API_URL}/api/private/account/`, { 
      credentials: 'include',
      headers: useRequestHeaders(['cookie'])
    })
    isAuthenticated = true
  } catch (e) {
    isAuthenticated = false
  }

  // Handle private pages - redirect unauthenticated users to sign-in
  if (to.meta.layout === 'private' && !isAuthenticated) {
    return navigateTo('/sign-in')
  }

  // Handle auth pages - redirect authenticated users to home
  const authPages = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password']
  if (authPages.includes(to.path) && isAuthenticated) {
    return navigateTo('/home')
  }
})