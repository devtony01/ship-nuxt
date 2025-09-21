<script setup lang="ts">
import { ref } from 'vue'

import { toTypedSchema } from '@vee-validate/zod'
import config from 'config'
import { accountApi } from 'resources/account'
import { handleApiError } from 'utils'
import { useField, useForm } from 'vee-validate'
import { z } from 'zod'

import { signUpSchema } from '@ship-nuxt/schemas'
import { SignUpParams } from 'types'

import UnauthorizedLayout from 'layouts/UnauthorizedLayout.vue'

const schema = toTypedSchema(signUpSchema)

type SignUpInput = z.infer<typeof signUpSchema>

const submittedEmail = ref('')
const apiErrors = ref<Record<string, string | boolean>>({})

const {
  mutate: signUp,
  isPending: isSignUpPending,
  isSuccess: isSignUpSuccess,
  data: signUpData,
} = accountApi.useSignUp()

const {
  handleSubmit,
  errors,
  meta: formMeta,
  isSubmitting,
} = useForm<SignUpInput>({
  validationSchema: schema,
  initialValues: {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  },
})

const { value: firstName } = useField<string>('firstName')
const { value: lastName } = useField<string>('lastName')
const { value: email } = useField<string>('email')
const { value: password } = useField<string>('password')

const onSubmit = handleSubmit(async (data: SignUpParams, ctx) => {
  apiErrors.value = {} as Record<string, string | boolean>
  signUp(data, {
    onSuccess: (data, variables) => {
      submittedEmail.value = variables.email
    },
    onError: (e) => {
      const errors = handleApiError(e, ctx.setErrors)
      apiErrors.value = errors
    },
  })
})

// useSeoMeta({
//   title: 'Sign Up',
// })
</script>

<template>
  <UnauthorizedLayout>
    <div class="w-full max-w-md">
      <div class="text-center mb-6">
        <h2 class="text-3xl font-extrabold">
          Sign Up
        </h2>
      </div>

      <div v-if="isSignUpSuccess" class="card bg-base-100 shadow-xl">
        <div class="card-body items-center text-center space-y-2">
          <h3 class="card-title">
            Thanks!
          </h3>
          <p class="text-base-content/70">
            Please follow the instructions from the email to complete a sign up process. We sent an
            email with a confirmation link to
            <span class="font-semibold">{{ submittedEmail }}</span>
          </p>
          <div v-if="signUpData?.emailVerificationToken" class="space-y-1 text-center">
            <p>You look like a cool developer 🧑‍💻</p>
            <a
              :href="`${config.API_URL}/api/account/verify-email?token=${signUpData.emailVerificationToken}`"
              target="_blank"
              class="link link-primary text-sm"
            >
              Verify email
            </a>
          </div>
        </div>
      </div>

      <form v-else class="card bg-base-100 shadow-xl" novalidate @submit.prevent="onSubmit">
        <div class="card-body space-y-4">
          <div class="form-control">
            <label class="label" for="firstName">
              <span class="label-text">First Name</span>
            </label>
            <input
              id="firstName"
              v-model="firstName"
              name="firstName"
              type="text"
              class="input input-bordered w-full"
              :class="[{ 'input-error': !!errors.firstName }]"
              placeholder="Enter first name"
              autocomplete="given-name"
              required
              :aria-invalid="!!errors.firstName"
              aria-describedby="firstName-help"
            >
            <p v-if="errors.firstName" id="firstName-help" class="mt-1 label-text-alt text-error">
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
              class="input input-bordered w-full"
              :class="[{ 'input-error': !!errors.lastName }]"
              placeholder="Enter last name"
              autocomplete="family-name"
              required
              :aria-invalid="!!errors.lastName"
              aria-describedby="lastName-help"
            >
            <p v-if="errors.lastName" id="lastName-help" class="mt-1 label-text-alt text-error">
              {{ errors.lastName }}
            </p>
          </div>

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
              v-model="password"
              name="password"
              type="password"
              class="input input-bordered w-full"
              :class="[{ 'input-error': !!errors.password }]"
              placeholder="Enter password"
              autocomplete="new-password"
              required
              :aria-invalid="!!errors.password"
              aria-describedby="password-help"
            >
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
              :disabled="!formMeta.valid || isSignUpPending"
              class="btn btn-primary w-full"
              :class="[
                {
                  'btn-disabled': !formMeta.valid || isSubmitting || isSignUpPending,
                  loading: isSubmitting || isSignUpPending,
                },
              ]"
            >
              <span>Sign Up</span>
            </button>
          </div>

          <div class="text-center">
            <span class="text-sm opacity-70">Have an account? </span>
            <RouterLink to="/sign-in" class="link link-primary text-sm">
              Sign In
            </RouterLink>
          </div>
        </div>
      </form>
    </div>
  </UnauthorizedLayout>
</template>
