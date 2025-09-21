import { mount } from '@vue/test-utils'

import { describe, expect, it } from 'vitest'

import Table from '../Table/index.vue'

describe('table', () => {
  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ]

  const mockColumns = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' }
  ]

  it('renders properly with data', () => {
    const wrapper = mount(Table, {
      props: {
        data: mockData,
        columns: mockColumns,
        totalCount: 2,
        pageCount: 1,
        page: 1,
        perPage: 10,
        isLoading: false
      }
    })
    
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.text()).toContain('John Doe')
    expect(wrapper.text()).toContain('jane@example.com')
  })

  it('shows loading state', () => {
    const wrapper = mount(Table, {
      props: {
        data: [],
        columns: mockColumns,
        totalCount: 0,
        pageCount: 0,
        page: 1,
        perPage: 10,
        isLoading: true
      }
    })
    
    expect(wrapper.find('.loading').exists()).toBe(true)
  })
})