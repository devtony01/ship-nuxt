<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'

import { toTypedSchema } from '@vee-validate/zod'
import { accountApi } from 'resources/account'
import { handleApiError } from 'utils'
import { useField, useForm } from 'vee-validate'
import { z } from 'zod'

import { forgotPasswordSchema } from '@ship-nuxt/schemas'
import type { ApiError } from 'types'

import UnauthorizedLayout from 'layouts/UnauthorizedLayout.vue'

const schema = toTypedSchema(forgotPasswordSchema)

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

const { handleSubmit, errors } = useForm({
  validationSchema: schema,
})

const apiErrors = ref<Record<string, string | boolean>>({})
const isSubmitted = ref(false)
const submittedEmail = ref('')

const { value: email } = useField<string>('email')

const { mutate: forgotPassword, isPending: isLoading } = accountApi.useForgotPassword()

const onSubmit = handleSubmit((values: ForgotPasswordInput, ctx) => {
  apiErrors.value = {} as Record<string, string | boolean>
  forgotPassword(values, {
    onSuccess: () => {
      isSubmitted.value = true
      submittedEmail.value = values.email
      toast.success('Password reset instructions sent to your email!')
    },
    onError: (e: ApiError) => {
      const errors = handleApiError(e, ctx.setErrors)
      apiErrors.value = errors
    },
  })
})

// SEO meta would be handled by vue-meta or similar
// useSeoMeta({
//   title: 'Forgot Password',
//   ogTitle: 'Forgot Password',
//   description: 'Reset your password',
//   ogDescription: 'Reset your password',
// })
</script>

<template>
  <UnauthorizedLayout>
    <div class="w-full max-w-md">
      <div class="text-center mb-6">
        <h2 class="text-3xl font-extrabold">Forgot Password</h2>
      </div>

      <div v-if="isSubmitted" class="card bg-base-100 shadow-xl">
        <div class="card-body items-center text-center space-y-2">
          <h3 class="card-title">Check Your Email</h3>
          <p class="text-base-content/70">
            We've sent password reset instructions to
            <span class="font-semibold">{{ submittedEmail }}</span>
          </p>
          <p class="text-sm text-base-content/60">
            Please check your email and follow the instructions to reset your password.
          </p>
          <div class="pt-4">
            <RouterLink to="/sign-in" class="btn btn-primary"> Back to Sign In </RouterLink>
          </div>
        </div>
      </div>

      <form v-else class="card bg-base-100 shadow-xl" novalidate @submit.prevent="onSubmit">
        <div class="card-body space-y-4">
          <p class="text-base-content/70 text-center">
            Enter your email address and we'll send you instructions to reset your password.
          </p>

          <div class="form-control">
            <label class="label" for="email">
              <span class="label-text">Email Address</span>
            </label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              class="input input-bordered w-full"
              :class="[{ 'input-error': !!errors.email }]"
              placeholder="Enter email address"
              autocomplete="email"
              required
              :aria-invalid="!!errors.email"
              aria-describedby="email-help"
              :disabled="isLoading"
            />
            <p v-if="errors.email" id="email-help" class="mt-1 label-text-alt text-error">
              {{ errors.email }}
            </p>
          </div>

          <!-- API Error Display -->
          <div v-if="Object.keys(apiErrors).length > 0" class="space-y-2">
            <div v-for="(error, key) in apiErrors" :key="key" class="alert alert-error">
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
              <span>{{ error }}</span>
            </div>
          </div>

          <div class="form-control mt-6">
            <button
              type="submit"
              :disabled="isLoading || !email"
              class="btn btn-primary w-full"
              :class="[{ 'btn-disabled': isLoading || !email, loading: isLoading }]"
            >
              <span>{{ isLoading ? 'Sending...' : 'Send Reset Instructions' }}</span>
            </button>
          </div>

          <div class="text-center">
            <span class="text-sm opacity-70">Remember your password? </span>
            <RouterLink to="/sign-in" class="link link-primary text-sm"> Sign In </RouterLink>
          </div>
        </div>
      </form>
    </div>
  </UnauthorizedLayout>
</template>
