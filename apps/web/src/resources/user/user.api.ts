import type { ComputedRef, Ref } from 'vue'
import { unref } from 'vue'

import { useQuery, UseQueryOptions } from '@tanstack/vue-query'
import { apiService } from 'services'

import type { ApiError, ListParams, ListResult, User } from 'types'

export interface UserListFilterParams {
  search?: string
  createdAt?: {
    startDate: string
    endDate: string
  }
}

export type UserListSortFields = 'createdAt' | 'firstName' | 'lastName'

export type UserListParams = ListParams<UserListFilterParams, Pick<User, UserListSortFields>>
export type UserListResponse = ListResult<User>

export const useList = (
  params: Ref<UserListParams> | ComputedRef<UserListParams>,
  options?: Partial<UseQueryOptions<UserListResponse, ApiError>>,
) =>
  useQuery<UserListResponse, ApiError>({
    queryKey: ['users', params],
    queryFn: () => apiService.get('/api/private/users', unref(params)),
    ...options,
  })
