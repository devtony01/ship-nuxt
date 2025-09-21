import type { ColumnDef } from '@tanstack/vue-table'
import type { UserListParams, UserListSortFields } from 'resources/user'

import type { User } from 'types'

export const DEFAULT_PAGE = 1
export const PER_PAGE = 10
export const EXTERNAL_SORT_FIELDS: Array<UserListSortFields> = ['createdAt']

export const DEFAULT_PARAMS: UserListParams = {
  page: DEFAULT_PAGE,
  perPage: PER_PAGE,
  searchValue: '',
  filter: {
    search: '',
  },
  sort: {
    createdAt: 'desc',
  },
}

export const COLUMNS: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: info => info.getValue(),
  },
  {
    accessorKey: 'firstName',
    header: 'First Name',
    cell: info => info.getValue(),
    enableSorting: true,
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
    cell: info => info.getValue(),
    enableSorting: true,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: info => info.getValue(),
  },
  {
    accessorKey: 'isEmailVerified',
    header: 'Verified',
    cell: info => info.getValue() ? '✅' : '❌',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: info => new Date(info.getValue() as string).toLocaleDateString(),
    enableSorting: true,
  },
]