<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import config from 'config'
import { accountApi } from 'resources/account'
import { handleApiError } from 'utils'
import { useField, useForm } from 'vee-validate'
import { z } from 'zod'

import { signUpSchema } from '@ship-nuxt/schemas'
import { SignUpParams } from 'types'

const schema = toTypedSchema(signUpSchema)

type SignUpInput = z.infer<typeof signUpSchema>

const submittedEmail = ref('')

const {
  mutate: signUp,
  isPending: isSignUpPending,
  isSuccess: isSignUpSuccess,
  data: signUpData,
} = accountApi.useSignUp();

const { handleSubmit, errors, meta: formMeta, isSubmitting } = useForm<SignUpInput>({
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
  signUp(data, {
    onSuccess: (data, variables) => {
      submittedEmail.value = variables.email;
    },
    onError: (e) => {
      handleApiError(e, ctx.setErrors)
    }
  })
})

useSeoMeta({
  title: 'Sign Up',
})
</script>

<template>
  <NuxtLayout name="unauthorized">
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
            Please follow the instructions from the email to complete a sign up process.
            We sent an email with a confirmation link to
            <span class="font-semibold">{{ submittedEmail }}</span>
          </p>
          <div v-if="signUpData?.emailVerificationToken" class="space-y-1 text-center">
            <p>You look like a cool developer 🧑‍💻</p>
            <a
              :href="`${config.API_URL}/api/account/verify-email?token=${signUpData.emailVerificationToken}`"
              target="_blank" class="link link-primary text-sm"
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
              v-model="firstName" name="firstName" type="text"
              class="input input-bordered w-full" :class="[{ 'input-error': !!errors.firstName }]"
              placeholder="Enter first name" autocomplete="given-name" required :aria-invalid="!!errors.firstName"
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
              v-model="lastName" name="lastName" type="text"
              class="input input-bordered w-full" :class="[{ 'input-error': !!errors.lastName }]"
              placeholder="Enter last name" autocomplete="family-name" required :aria-invalid="!!errors.lastName"
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
              v-model="email" name="email" type="email"
              class="input input-bordered w-full" :class="[{ 'input-error': !!errors.email }]"
              placeholder="Enter email address" autocomplete="email" required :aria-invalid="!!errors.email"
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
              v-model="password" name="password" type="password"
              class="input input-bordered w-full" :class="[{ 'input-error': !!errors.password }]"
              placeholder="Enter password" autocomplete="new-password" required :aria-invalid="!!errors.password"
              aria-describedby="password-help"
            >
            <p v-if="errors.password" id="password-help" class="mt-1 label-text-alt text-error">
              {{ errors.password }}
            </p>
          </div>

          <div class="form-control mt-6">
            <button
              type="submit" :disabled="!formMeta.valid || isSignUpPending"
              class="btn btn-primary w-full" :class="[{ 'btn-disabled': !formMeta.valid || isSubmitting || isSignUpPending, loading: isSubmitting || isSignUpPending }]"
            >
              <span>Sign Up</span>
            </button>
          </div>

          <div class="text-center">
            <span class="text-sm opacity-70">Have an account? </span>
            <NuxtLink to="/sign-in" class="link link-primary text-sm">
              Sign In
            </NuxtLink>
          </div>
        </div>
      </form>
    </div>
  </NuxtLayout>
</template>