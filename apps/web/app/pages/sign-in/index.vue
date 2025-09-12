<script setup lang="ts">
import { toast } from 'vue-sonner'

import { toTypedSchema } from '@vee-validate/zod'
import config from 'config'
import { accountApi } from 'resources/account'
import { handleApiError } from 'utils'
import { useField, useForm } from 'vee-validate'
import { z } from 'zod'

import { signInSchema } from '@ship-nuxt/schemas'
import type { ApiError } from 'types'

const schema = toTypedSchema(signInSchema)

type SignInInput = z.infer<typeof signInSchema>

const { handleSubmit, errors } = useForm({
  validationSchema: schema,
})

// Additional errors for API responses
const apiErrors = ref<Record<string, string | boolean>>({})

const { value: email } = useField<string>('email')
const { value: password } = useField('password')

const { mutate: signIn, isPending: isLoading } = accountApi.useSignIn()
const { mutate: resendEmail, isPending: isResendingEmail } = accountApi.useResendEmail()

const onSubmit = handleSubmit((values: SignInInput, ctx) => {
  apiErrors.value = {} as Record<string, string | boolean>
  signIn(values, {
    onSuccess: () => {
      toast.success('Welcome back!')
      navigateTo('/profile')
    },
    onError: (e: ApiError) => {
      handleApiError(e, ctx.setErrors)
    }
  })
})

const onResendEmail = () => {
  if (!email.value || isResendingEmail.value) return

  resendEmail(
    { email: email.value },
    {
      onSuccess: () => {
        toast.success('Verification email sent! Please check your inbox.')
      },
      onError: (e: ApiError) => {
        handleApiError(e)
      }
    }
  )
}

// Page meta
definePageMeta({
  layout: 'unauthorized'
})

// SEO
useSeoMeta({
  title: 'Sign In',
  ogTitle: 'Sign In',
  description: 'Sign in to your account',
  ogDescription: 'Sign in to your account',
})
</script>

<template>
  <NuxtLayout name="unauthorized">
    <div class="w-full max-w-md">
      <div class="text-center mb-6">
        <h2 class="text-3xl font-extrabold">
          Sign In
        </h2>
      </div>

      <form class="card bg-base-100 shadow-xl" novalidate @submit.prevent="onSubmit">
        <div class="card-body space-y-4">
          <div class="form-control">
            <label class="label" for="email">
              <span class="label-text">Email Address</span>
            </label>
            <input
              id="email"
              v-model="email" name="email" type="email"
              class="input input-bordered w-full" :class="[{ 'input-error': !!errors.email }]"
              placeholder="Enter email address" autocomplete="email" required :aria-invalid="!!errors.email"
              aria-describedby="email-help" :disabled="isLoading"
            >
            <p v-if="errors.email" id="email-help" class="mt-1 label-text-alt text-error">
              {{ errors.email }}
            </p>
          </div>

          <div class="form-control">
            <label class="label" for="password">
              <span class="label-text">Password</span>
            </label>
            <input
              id="password"
              v-model="password" name="password" type="password"
              class="input input-bordered w-full" :class="[{ 'input-error': !!errors.password }]"
              placeholder="Enter password" autocomplete="current-password" required :aria-invalid="!!errors.password"
              aria-describedby="password-help" :disabled="isLoading"
            >
            <p v-if="errors.password" id="password-help" class="mt-1 label-text-alt text-error">
              {{ errors.password }}
            </p>
          </div>

          <div v-if="apiErrors.credentials" class="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ apiErrors.credentials }}</span>
          </div>

          <div v-if="apiErrors.emailVerificationTokenExpired" class="alert alert-warning">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <div>Please verify your email to sign in.</div>
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

          <div class="text-right">
            <NuxtLink to="/forgot-password" class="link link-primary text-sm">
              Forgot your password?
            </NuxtLink>
          </div>

          <div class="form-control mt-6">
            <button
              type="submit" :disabled="isLoading || !email || !password"
              class="btn btn-primary w-full" :class="[{ 'btn-disabled': isLoading || !email || !password, loading: isLoading }]"
            >
              <span>{{ isLoading ? 'Signing in...' : 'Sign In' }}</span>
            </button>
          </div>

          <div class="divider">
            Or continue with
          </div>

          <a
            :href="`${config.API_URL}/api/account/sign-in/google`"
            class="btn btn-outline w-full"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span class="ml-2">Continue with Google</span>
          </a>

          <div class="text-center">
            <span class="text-sm opacity-70">Don't have an account? </span>
            <NuxtLink to="/sign-up" class="link link-primary text-sm">
              Sign Up
            </NuxtLink>
          </div>
        </div>
      </form>
    </div>
  </NuxtLayout>
</template>