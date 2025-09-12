<script setup lang="ts">
import { toast } from 'vue-sonner'

import { accountApi } from 'resources/account'
import { handleApiError } from 'utils'

import type { ApiError } from 'types'

// Check authentication state
const { data: user, isLoading } = accountApi.useGet()
const { mutateAsync: signOut, isPending: isSigningOut } = accountApi.useSignOut()

// Computed properties for user data
const userInitial = computed(() => {
  if (!user.value) return 'U'
  
  return user.value.firstName?.charAt(0)?.toUpperCase() || 
         user.value.email?.charAt(0)?.toUpperCase() || 
         'U'
})

const userFullName = computed(() => {
  if (!user.value) return ''
  
  return `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim()
})

// Sign out handler
const onSignOut = async () => {
  try {
    await signOut()
    toast.success('Signed out successfully')
    await navigateTo('/sign-in')
  } catch (error: unknown) {
    handleApiError(error as ApiError)
    toast.error('Failed to sign out')
  }
}
</script>

<template>
  <div class="navbar bg-base-200 border-b border-base-300 fixed top-0 left-0 right-0 z-50">
    <div class="flex-1">
      <NuxtLink to="/" class="btn btn-ghost text-xl">
        Ship Nuxt
      </NuxtLink>
    </div>

    <!-- Center area: filled by pages via <template #nav-center> -->
    <div class="hidden md:flex">
      <slot name="center" />
    </div>

    <!-- Right actions: filled by pages via <template #nav-right> or default auth buttons -->
    <div class="flex-none gap-2">
      <!-- Check if slot content is provided -->
      <slot name="right">
        <!-- Default content when no slot is provided -->
        <!-- Show loading state -->
        <div v-if="isLoading" class="flex items-center gap-2">
          <span class="loading loading-spinner loading-sm" />
        </div>
        
        <!-- Show authenticated user menu -->
        <div v-else-if="user" class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
            <div class="w-8 h-8 rounded-full bg-primary text-primary-content !flex items-center justify-center">
              <span class="text-sm font-medium leading-none">
                {{ userInitial }}
              </span>
            </div>
          </div>
          <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li class="menu-title">
              <span>{{ userFullName }}</span>
            </li>
            <li><NuxtLink to="/dashboard">Dashboard</NuxtLink></li>
            <li><NuxtLink to="/profile">Profile</NuxtLink></li>
            <li><a>Settings</a></li>
            <li><hr class="my-2"></li>
            <li>
              <button 
                :disabled="isSigningOut" 
                class="w-full text-left"
                @click="onSignOut"
              >
                {{ isSigningOut ? 'Signing out...' : 'Sign Out' }}
              </button>
            </li>
          </ul>
        </div>
        
        <!-- Show auth buttons for unauthenticated users -->
        <div v-else class="flex items-center gap-2">
          <NuxtLink to="/sign-in" class="btn btn-ghost btn-sm">
            Sign In
          </NuxtLink>
          <NuxtLink to="/sign-up" class="btn btn-primary btn-sm">
            Sign Up
          </NuxtLink>
        </div>
      </slot>
    </div>
  </div>
</template>
