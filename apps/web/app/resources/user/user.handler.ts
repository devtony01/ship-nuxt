import queryClient from 'query-client'
import { apiService, socketService } from 'services'

import type { User } from 'types'

apiService.on('error', (error) => {
  if (error.status === 401) {
    queryClient.setQueryData<User | null>(['account'], null)
  }
})

socketService.on('connect', () => {
  const account = queryClient.getQueryData<User | null>(['account'])

  if (account) socketService.emit('subscribe', `user-${account.id}`)
})

socketService.on('user:updated', (user) => {
  queryClient.setQueryData<User | null>(['account'], user)
})