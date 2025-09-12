<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'

import { toTypedSchema } from '@vee-validate/zod'
import { accountApi } from 'resources/account'
import { handleApiError } from 'utils'
import { useField, useForm } from 'vee-validate'
import { z } from 'zod'

import { resetPasswordSchema } from '@ship-nuxt/schemas'
import type { ApiError } from 'types'

const route = useRoute()

const schema = toTypedSchema(resetPasswordSchema.extend({
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}))

type ResetPasswordInput = z.infer<typeof resetPasswordSchema> & {
  confirmPassword: string
}

const { handleSubmit, errors } = useForm({
  validationSchema: schema,
})

const { value: password } = useField('password')
const { value: confirmPassword } = useField('confirmPassword')

const isInvalidToken = ref(false)

const { mutate: resetPassword, isPending: isLoading, isSuccess } = accountApi.useResetPassword()

const token = computed(() => {
  const queryToken = route.query.token
  return Array.isArray(queryToken) ? queryToken[0] ?? '' : queryToken ?? ''
})

onMounted(() => {
  if (!token.value) {
    isInvalidToken.value = true
  }
})

const onSubmit = handleSubmit((values: ResetPasswordInput, ctx) => {
  if (!token.value) {
    isInvalidToken.value = true
    return
  }

  resetPassword(
    {
      token: token.value,
      password: values.password,
    },
    {
      onSuccess: () => {
        toast.success('Password reset successfully!')
      },
      onError: (error: ApiError) => {
        const errorData = error.data as Record<string, unknown>
        
        if (error.status === 400 && typeof errorData?.message === 'string' && errorData.message.includes('token')) {
          isInvalidToken.value = true
        } else {
          handleApiError(error, ctx.setErrors)
        }
      }
    }
  )
})

// SEO
useSeoMeta({
  title: 'Reset Password',
  ogTitle: 'Reset Password',
  description: 'Reset your password',
  ogDescription: 'Reset your password',
})
</script>

<template>
  <NuxtLayout name="unauthorized">
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        <div v-if="isSuccess" class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">
                Password reset successful!
              </h3>
              <div class="mt-2 text-sm text-green-700">
                <p>
                  Your password has been updated. You can now sign in with your new password.
                </p>
              </div>
              <div class="mt-4">
                <NuxtLink
                  to="/sign-in"
                  class="text-sm font-medium text-green-800 underline hover:text-green-900"
                >
                  Go to sign in
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="isInvalidToken" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Invalid or expired reset link
              </h3>
              <div class="mt-2 text-sm text-red-700">
                <p>
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
              </div>
              <div class="mt-4">
                <NuxtLink
                  to="/forgot-password"
                  class="text-sm font-medium text-red-800 underline hover:text-red-900"
                >
                  Request new reset link
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <form v-else class="mt-8 space-y-6" @submit.prevent="onSubmit">
          <div class="space-y-4">
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                New password
              </label>
              <input
                id="password"
                v-model="password"
                name="password"
                type="password"
                autocomplete="new-password"
                required
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="Enter your new password"
                :disabled="isLoading"
              >
              <p v-if="errors.password" class="mt-1 text-sm text-red-600">
                {{ errors.password }}
              </p>
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                name="confirmPassword"
                type="password"
                autocomplete="new-password"
                required
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="Confirm your new password"
                :disabled="isLoading"
              >
              <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
                {{ errors.confirmPassword }}
              </p>
            </div>
          </div>



          <div class="space-y-4">
            <button
              type="submit"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isLoading || !password || !confirmPassword"
            >
              {{ isLoading ? 'Resetting...' : 'Reset password' }}
            </button>

            <div class="text-center">
              <NuxtLink
                to="/sign-in"
                class="font-medium text-emerald-600 hover:text-emerald-500"
              >
                Back to sign in
              </NuxtLink>
            </div>
          </div>
        </form>
      </div>
    </div>
  </NuxtLayout>
</template>