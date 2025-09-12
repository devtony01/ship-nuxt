<script setup lang="ts">
import { toast } from 'vue-sonner'

import { toTypedSchema } from '@vee-validate/zod'
import { accountApi } from 'resources/account'
import { handleApiError } from 'utils'
import { useField, useForm } from 'vee-validate'
import { z } from 'zod'

import { forgotPasswordSchema } from '@ship-nuxt/schemas'
import type { ApiError } from 'types'

const schema = toTypedSchema(forgotPasswordSchema)

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

const { handleSubmit, errors } = useForm({
  validationSchema: schema,
})

const { value: email } = useField('email')

const { mutate: forgotPassword, isPending: isLoading, isSuccess } = accountApi.useForgotPassword()

const onSubmit = handleSubmit((values: ForgotPasswordInput, ctx) => {
  forgotPassword(values, {
    onSuccess: () => {
      toast.success('Password reset link sent!')
    },
    onError: (error: ApiError) => {
      handleApiError(error, ctx.setErrors)
    }
  })
})

// SEO
useSeoMeta({
  title: 'Forgot Password',
  ogTitle: 'Forgot Password',
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
            Forgot your password?
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
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
                Reset link sent!
              </h3>
              <div class="mt-2 text-sm text-green-700">
                <p>
                  We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
                </p>
              </div>
              <div class="mt-4">
                <NuxtLink
                  to="/sign-in"
                  class="text-sm font-medium text-green-800 underline hover:text-green-900"
                >
                  Back to sign in
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <form v-else class="mt-8 space-y-6" @submit.prevent="onSubmit">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
              placeholder="Enter your email address"
              :disabled="isLoading"
            >
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">
              {{ errors.email }}
            </p>
          </div>



          <div class="space-y-4">
            <button
              type="submit"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isLoading || !email"
            >
              {{ isLoading ? 'Sending...' : 'Send reset link' }}
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