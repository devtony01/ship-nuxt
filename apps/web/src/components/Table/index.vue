<script setup lang="ts" generic="T">
import { computed, ref, watch } from 'vue'

import type {ColumnDef, SortingState} from '@tanstack/vue-table';
import {
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  useVueTable} from '@tanstack/vue-table'

const props = withDefaults(defineProps<{
  data?: T[]
  totalCount?: number
  columns: ColumnDef<T>[]
  pageCount?: number
  page?: number
  perPage?: number
  isLoading?: boolean
}>(), {
  data: () => [],
  totalCount: 0,
  page: 1,
  perPage: 10,
  isLoading: false
})

// Define emits
const emit = defineEmits<{
  pageChange: [page: number]
  sortingChange: [sort: Record<string, 'asc' | 'desc'>]
  rowClick: [row: T]
}>()

// Table state
const sorting = ref<SortingState>([])
const pagination = ref({
  pageIndex: (props.page - 1) || 0,
  pageSize: props.perPage,
})

// Watch for external page changes
watch(() => props.page, (newPage) => {
  const newPageIndex = (newPage - 1) || 0
  if (pagination.value.pageIndex !== newPageIndex) {
    pagination.value.pageIndex = newPageIndex
  }
}, { immediate: true })

// Reactive data for table
const tableData = computed(() => props.data || [])

// Create table instance
const table = useVueTable({
  get data() {
    return tableData.value
  },
  columns: props.columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  onSortingChange: updaterOrValue => {
    sorting.value = typeof updaterOrValue === 'function' 
      ? updaterOrValue(sorting.value) 
      : updaterOrValue
  },
  onPaginationChange: updaterOrValue => {
    const newPagination = typeof updaterOrValue === 'function'
      ? updaterOrValue(pagination.value)
      : updaterOrValue
    
    // Only update if the page actually changed to avoid infinite loops
    if (newPagination.pageIndex !== pagination.value.pageIndex) {
      pagination.value = newPagination
      emit('pageChange', newPagination.pageIndex + 1)
    }
    
    // Handle page size changes
    if (newPagination.pageSize !== pagination.value.pageSize) {
      pagination.value = newPagination
      // Could add onPerPageChange callback here if needed
    }
  },
  state: {
    get sorting() { return sorting.value },
    get pagination() { return pagination.value },
  },
  manualPagination: true,
  manualSorting: true,
  get pageCount() {
    return props.pageCount || Math.ceil(props.totalCount / props.perPage)
  },
})

// Watch sorting changes
watch(sorting, (newSorting) => {
  const sortObject = newSorting.reduce((acc, sort) => {
    acc[sort.id] = sort.desc ? 'desc' : 'asc'
    return acc
  }, {} as Record<string, 'asc' | 'desc'>)
  emit('sortingChange', sortObject)
}, { deep: true })

// Handle row click
const handleRowClick = (row: T) => {
  emit('rowClick', row)
}

// Watch for per page changes
watch(() => props.perPage, (newPerPage) => {
  if (pagination.value.pageSize !== newPerPage) {
    pagination.value.pageSize = newPerPage
  }
}, { immediate: true })

// Watch for data changes to ensure table updates
watch(() => props.data, () => {
  // Force table to re-render when data changes
}, { deep: true })

// Watch for total count changes to update page count
watch(() => props.totalCount, () => {
  // This will trigger table re-calculation
}, { immediate: true })
</script>

<template>
  <!-- Loading state -->
  <div v-if="isLoading" class="flex justify-center py-8">
    <span class="loading loading-spinner loading-lg" />
  </div>

  <!-- Table content -->
  <div v-else-if="totalCount > 0" class="space-y-4">
    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="table table-zebra w-full">
        <thead>
          <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              class="cursor-pointer select-none"
              @click="header.column.getToggleSortingHandler()?.($event)"
            >
              <div class="flex items-center gap-2">
                <FlexRender
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
                <span v-if="header.column.getIsSorted()">
                  {{ header.column.getIsSorted() === 'desc' ? '↓' : '↑' }}
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="row in table.getRowModel().rows" 
            :key="row.id"
            class="hover:bg-base-200 cursor-pointer"
            @click="handleRowClick(row.original)"
          >
            <td v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-sm">
          Showing {{ table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 }} 
          to {{ Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, totalCount) }} 
          of {{ totalCount }} results
        </span>
      </div>
      
      <div class="join">
        <button
          class="join-item btn btn-sm"
          :disabled="!table.getCanPreviousPage()"
          @click="table.previousPage()"
        >
          Previous
        </button>
        
        <button class="join-item btn btn-sm btn-active">
          Page {{ table.getState().pagination.pageIndex + 1 }} of {{ table.getPageCount() }}
        </button>
        
        <button
          class="join-item btn btn-sm"
          :disabled="!table.getCanNextPage()"
          @click="table.nextPage()"
        >
          Next
        </button>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm">Show:</span>
        <select
          class="select select-bordered select-sm"
          :value="table.getState().pagination.pageSize"
          @change="table.setPageSize(Number(($event.target as HTMLSelectElement).value))"
        >
          <option value="5">
            5
          </option>
          <option value="10">
            10
          </option>
          <option value="20">
            20
          </option>
          <option value="50">
            50
          </option>
        </select>
      </div>
    </div>
  </div>

  <!-- Empty state -->
  <div v-else class="text-center py-8">
    <div class="text-base-content/50">
      No data found
    </div>
  </div>
</template>