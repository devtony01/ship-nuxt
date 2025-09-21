<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import { toTypedSchema } from '@vee-validate/zod'
import { accountApi } from 'resources/account'
import { handleApiError } from 'utils'
import { useField, useForm } from 'vee-validate'
import { z } from 'zod'

import { resetPasswordSchema } from '@ship-nuxt/schemas'
import type { ApiError } from 'types'

import UnauthorizedLayout from 'layouts/UnauthorizedLayout.vue'

const route = useRoute()
const router = useRouter()

const schema = toTypedSchema(resetPasswordSchema)

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

const { handleSubmit, errors } = useForm({
  validationSchema: schema,
})

const apiErrors = ref<Record<string, string | boolean>>({})
const isSuccess = ref(false)
const token = ref('')

const { value: password } = useField<string>('password')

const { mutate: resetPassword, isPending: isLoading } = accountApi.useResetPassword()

// Get token from URL query params
onMounted(() => {
  const tokenParam = route.query.token as string
  if (tokenParam) {
    token.value = tokenParam
  } else {
    // If no token, redirect to forgot password
    toast.error('Invalid or missing reset token')
    router.push('/forgot-password')
  }
})

const onSubmit = handleSubmit((values: ResetPasswordInput, ctx) => {
  apiErrors.value = {} as Record<string, string | boolean>

  const resetData = {
    ...values,
    token: token.value,
  }

  resetPassword(resetData, {
    onSuccess: () => {
      isSuccess.value = true
      toast.success('Password reset successfully!')
    },
    onError: (e: ApiError) => {
      const errors = handleApiError(e, ctx.setErrors)
      apiErrors.value = errors

      // If token is invalid, redirect to forgot password
      if (errors.token) {
        setTimeout(() => {
          router.push('/forgot-password')
        }, 3000)
      }
    },
  })
})

// SEO meta would be handled by vue-meta or similar
// useSeoMeta({
//   title: 'Reset Password',
//   ogTitle: 'Reset Password',
//   description: 'Set your new password',
//   ogDescription: 'Set your new password',
// })
</script>

<template>
  <UnauthorizedLayout>
    <div class="w-full max-w-md">
      <div class="text-center mb-6">
        <h2 class="text-3xl font-extrabold">Reset Password</h2>
      </div>

      <div v-if="isSuccess" class="card bg-base-100 shadow-xl">
        <div class="card-body items-center text-center space-y-2">
          <h3 class="card-title text-success">Password Reset Successfully!</h3>
          <p class="text-base-content/70">
            Your password has been reset. You can now sign in with your new password.
          </p>
          <div class="pt-4">
            <RouterLink to="/sign-in" class="btn btn-primary"> Sign In </RouterLink>
          </div>
        </div>
      </div>

      <form v-else class="card bg-base-100 shadow-xl" novalidate @submit.prevent="onSubmit">
        <div class="card-body space-y-4">
          <p class="text-base-content/70 text-center">Enter your new password below.</p>

          <div class="form-control">
            <label class="label" for="password">
              <span class="label-text">New Password</span>
            </label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              class="input input-bordered w-full"
              :class="[{ 'input-error': !!errors.password }]"
              placeholder="Enter new password"
              autocomplete="new-password"
              required
              :aria-invalid="!!errors.password"
              aria-describedby="password-help"
              :disabled="isLoading"
            />
            <p v-if="errors.password" id="password-help" class="mt-1 label-text-alt text-error">
              {{ errors.password }}
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
              :disabled="isLoading || !password || !token"
              class="btn btn-primary w-full"
              :class="[{ 'btn-disabled': isLoading || !password || !token, loading: isLoading }]"
            >
              <span>{{ isLoading ? 'Resetting...' : 'Reset Password' }}</span>
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
