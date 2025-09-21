<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import { toTypedSchema } from '@vee-validate/zod'
import { accountApi } from 'resources/account'
import { socketService } from 'services'
import { handleApiError } from 'utils'
import { useField, useForm } from 'vee-validate'
import { z } from 'zod'

import { updateUserSchema } from '@ship-nuxt/schemas'
import type { ApiError } from 'types'

import DefaultLayout from 'layouts/DefaultLayout.vue'

const router = useRouter()

const schema = toTypedSchema(updateUserSchema)

type UpdateProfileInput = z.infer<typeof updateUserSchema>

const { handleSubmit, errors } = useForm({
  validationSchema: schema,
})

const { value: firstName } = useField('firstName')
const { value: lastName } = useField('lastName')

const { data: user, isLoading, error, refetch } = accountApi.useGet()

const { mutateAsync: updateProfile, isPending: isUpdating } = accountApi.useUpdate()
const { mutateAsync: signOut, isPending: isSigningOut } = accountApi.useSignOut()
const { mutateAsync: resendEmail, isPending: isResendingEmail } = accountApi.useResendEmail()

const isSocketConnected = ref(false)

// Check socket connection status
if (typeof window !== 'undefined') {
  const checkConnection = () => {
    isSocketConnected.value = socketService.connected()
  }

  // Check initially and set up interval
  checkConnection()
  const interval = setInterval(checkConnection, 1000)

  onUnmounted(() => {
    clearInterval(interval)
  })
}

// Watch for user data and populate form
watch(
  user,
  (newUser) => {
    if (newUser) {
      firstName.value = newUser.firstName
      lastName.value = newUser.lastName
    }
  },
  { immediate: true },
)

const onSubmit = handleSubmit(async (values: UpdateProfileInput, ctx) => {
  try {
    await updateProfile(values)
    await refetch()
    toast.success('Profile updated successfully!')
  } catch (error: unknown) {
    handleApiError(error as ApiError, ctx.setErrors)
  }
})

const onSignOut = async () => {
  try {
    await signOut()
    toast.success('Signed out successfully')
    await router.push('/sign-in')
  } catch (error: unknown) {
    handleApiError(error as ApiError)
    toast.error('Failed to sign out')
  }
}

const onResendEmail = async () => {
  if (!user.value?.email) return

  try {
    await resendEmail({ email: user.value.email })
    toast.success('Verification email sent! Please check your inbox.')
  } catch (error: unknown) {
    handleApiError(error as ApiError)
    toast.error('Failed to resend verification email')
  }
}

// SEO meta would be handled by vue-meta or similar
// useSeoMeta({
//   title: 'Profile',
//   ogTitle: 'Profile',
//   description: 'Manage your profile',
//   ogDescription: 'Manage your profile',
// })
</script>

<template>
  <DefaultLayout>
    <div class="container mx-auto px-6 py-8 max-w-4xl">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-4">
              <h1 class="card-title text-3xl">Profile</h1>
              <div class="flex items-center gap-2">
                <div
                  class="w-2 h-2 rounded-full"
                  :class="[isSocketConnected ? 'bg-success' : 'bg-error']"
                />
                <span class="text-sm opacity-70">
                  {{ isSocketConnected ? 'Connected' : 'Disconnected' }}
                </span>
              </div>
            </div>
            <button
              class="btn btn-outline btn-sm"
              :class="{ loading: isSigningOut }"
              :disabled="isSigningOut"
              @click="onSignOut"
            >
              {{ isSigningOut ? 'Signing out...' : 'Sign Out' }}
            </button>
          </div>

          <div v-if="isLoading" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg" />
          </div>

          <div v-else-if="error" class="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 class="font-bold">Failed to load profile</h3>
              <div class="text-xs">
                {{ (error as any)?.data?.message || 'Please try again later.' }}
              </div>
            </div>
          </div>

          <form v-else-if="user" class="space-y-6" @submit.prevent="onSubmit">
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div class="form-control">
                <label class="label" for="firstName">
                  <span class="label-text">First Name</span>
                </label>
                <input
                  id="firstName"
                  v-model="firstName"
                  name="firstName"
                  type="text"
                  :placeholder="user?.firstName || 'Enter your first name'"
                  required
                  class="input input-bordered w-full"
                  :class="{ 'input-error': !!errors.firstName }"
                  :disabled="isUpdating"
                />
                <p v-if="errors.firstName" class="label-text-alt text-error mt-1">
                  {{ errors.firstName }}
                </p>
              </div>

              <div class="form-control">
                <label class="label" for="lastName">
                  <span class="label-text">Last Name</span>
                </label>
                <input
                  id="lastName"
                  v-model="lastName"
                  name="lastName"
                  type="text"
                  :placeholder="user?.lastName || 'Enter your last name'"
                  required
                  class="input input-bordered w-full"
                  :class="{ 'input-error': !!errors.lastName }"
                  :disabled="isUpdating"
                />
                <p v-if="errors.lastName" class="label-text-alt text-error mt-1">
                  {{ errors.lastName }}
                </p>
              </div>
            </div>

            <div class="form-control">
              <label class="label" for="email">
                <span class="label-text">Email Address</span>
              </label>
              <input
                id="email"
                :value="user?.email"
                name="email"
                type="email"
                :placeholder="user?.email || 'Email address'"
                disabled
                class="input input-bordered w-full input-disabled"
              />
              <label class="label">
                <span class="label-text-alt opacity-70">Email address cannot be changed.</span>
              </label>
            </div>

            <div v-if="!user?.isEmailVerified" class="alert alert-warning">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div>
                <h3 class="font-bold">Email not verified</h3>
                <div class="text-xs">Please verify your email address to access all features.</div>
                <div class="mt-2">
                  <button
                    type="button"
                    class="link link-primary text-sm"
                    :disabled="isResendingEmail"
                    @click="onResendEmail"
                  >
                    {{ isResendingEmail ? 'Sending...' : 'Resend verification email' }}
                  </button>
                </div>
              </div>
            </div>

            <div class="form-control mt-6">
              <button
                type="submit"
                class="btn btn-primary"
                :class="{ loading: isUpdating }"
                :disabled="isUpdating || !firstName || !lastName"
              >
                {{ isUpdating ? 'Updating...' : 'Update Profile' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>
