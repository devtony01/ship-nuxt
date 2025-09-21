import { useMutation, useQuery, UseQueryOptions } from '@tanstack/vue-query'
import queryClient from 'query-client'
import { apiService } from 'services'

import type { 
  ApiError, 
  ForgotPasswordParams, 
  ResendEmailParams,
  ResetPasswordParams, 
  SignInParams, 
  SignUpParams, 
  UpdateUserParams,
  User 
} from 'types'

export interface SignUpResponse {
  emailVerificationToken: string
}

const useSignUp = <T = SignUpParams>() => {
  return useMutation<SignUpResponse, ApiError, T>({
    mutationFn: (data: T) => apiService.post<SignUpResponse, T>('/api/account/sign-up', data),
  })
}

const useSignIn = <T = SignInParams>() => {
  return useMutation<User, ApiError, T>({
    mutationFn: (data: T) => apiService.post<User, T>('/api/account/sign-in', data),
    onSuccess: (data) => {
      queryClient.setQueryData(['account'], data)
    }
  })
}

const useForgotPassword = <T = ForgotPasswordParams>() => {
  return useMutation<void, ApiError, T>({
    mutationFn: (data: T) => apiService.post<void, T>('/api/account/forgot-password', data),
  })
}

const useResetPassword = <T = ResetPasswordParams>() => {
  return useMutation<void, ApiError, T>({
    mutationFn: (data: T) => apiService.put<void, T>('/api/account/reset-password', data),
  })
}

const useResendEmail = <T = ResendEmailParams>() => {
  return useMutation<void, ApiError, T>({
    mutationFn: (data: T) => apiService.post<void, T>('/api/account/resend-email', data),
  })
}

const useGet = (options: Partial<UseQueryOptions<User, ApiError>> = {}) => {
  return useQuery<User, ApiError>({
    queryKey: ['account'],
    queryFn: () => apiService.get('/api/private/account'),
    staleTime: 60 * 1000, // 60 seconds
    ...options,
  })
}

const useUpdate = <T = UpdateUserParams>() => {
  return useMutation<User, ApiError, T>({
    mutationFn: (data: T) => apiService.put<User, T>('/api/private/account', data),
  })
}

const useSignOut = () => {
  return useMutation<void, ApiError, void>({
    mutationFn: () => apiService.post<void, void>('/api/account/sign-out'),
    onSuccess: () => {
      queryClient.setQueryData(['account'], null)
    }
  })
}

export { 
  useForgotPassword, 
  useGet, 
  useResendEmail, 
  useResetPassword, 
  useSignIn,
  useSignOut,
  useSignUp,
  useUpdate
}