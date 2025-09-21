<script setup lang="ts">
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'

import { Table } from 'components'
import type { UserListParams } from 'resources/user'
import { userApi } from 'resources/user'

import type { User } from 'types'

import { COLUMNS, DEFAULT_PARAMS } from './constants'

import DefaultLayout from 'layouts/DefaultLayout.vue'

// State
const params = ref<UserListParams>({ ...DEFAULT_PARAMS })

// Computed params for reactivity
const userListParams = computed(() => params.value)

// Fetch users data
const { data: usersData, isLoading, error } = userApi.useList(userListParams)

// Handlers
const onSortingChange = (sort: Record<string, 'asc' | 'desc'>) => {
  params.value = {
    ...params.value,
    sort,
  }
}

const onPageChange = (page: number) => {
  params.value = {
    ...params.value,
    page,
  }
}

const onSearchChange = (value: string) => {
  params.value = {
    ...params.value,
    searchValue: value || undefined,
    page: 1, // Reset to first page when searching
  }
}

const onRowClick = (user: User) => {
  toast.success(`Clicked on user: ${user.email}`)
}

// SEO meta would be handled by vue-meta or similar
// useSeoMeta({
//   title: 'Dashboard - Users',
//   ogTitle: 'Dashboard - Users',
//   description: 'User management dashboard',
//   ogDescription: 'User management dashboard',
// })
</script>

<template>
  <DefaultLayout>
    <div class="container mx-auto px-6 py-8 max-w-7xl">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex items-center justify-between mb-6">
            <h1 class="card-title text-3xl">Users Dashboard</h1>
            <div class="badge badge-primary">{{ usersData?.count || 0 }} total users</div>
          </div>

          <!-- Search -->
          <div class="form-control w-full max-w-xs mb-4">
            <label class="label">
              <span class="label-text">Search users</span>
            </label>
            <input
              :value="params.searchValue || ''"
              type="text"
              placeholder="Search by name or email..."
              class="input input-bordered w-full"
              @input="onSearchChange(($event.target as HTMLInputElement).value)"
            />
          </div>

          <!-- Error state -->
          <div v-if="error" class="alert alert-error mb-4">
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
              <h3 class="font-bold">Failed to load users</h3>
              <div class="text-xs">
                {{ (error as any)?.data?.message || 'Please try again later.' }}
              </div>
            </div>
          </div>

          <!-- Table Component -->
          <Table
            :data="usersData?.results"
            :total-count="usersData?.count || 0"
            :page-count="usersData?.pagesCount"
            :page="params.page"
            :per-page="params.perPage"
            :columns="COLUMNS"
            :is-loading="isLoading"
            @sorting-change="onSortingChange"
            @page-change="onPageChange"
            @row-click="onRowClick"
          />
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>
