import config from 'config'
import io from 'socket.io-client'

import type { User } from 'types'

const socket = io(config.WS_URL, {
  transports: ['websocket'],
  autoConnect: false,
  withCredentials: true,
})

export const connect = async () => {
  if (socket.connected) {
    return
  }

  socket.open()

  socket.on('connect', () => {
    console.warn('Socket connected')
  })

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error)
  })

  socket.on('disconnect', () => {
    console.warn('Socket disconnected')
  })
}

export const disconnect = () => {
  if (!socket.connected) return

  socket.disconnect()
}

export const emit = (event: string, ...args: unknown[]) => {
  socket.emit(event, ...args)
}

interface SocketListener {
  (event: string, callback: (data: unknown) => void): void
  (event: 'user:updated', callback: (user: User) => void): void
}

export const on: SocketListener = (event, callback) => {
  socket.on(event, callback)
}

export const off = (event: string, callback: (...args: unknown[]) => void) => {
  socket.off(event, callback)
}

export const connected = () => socket.connected

export const disconnected = () => socket.disconnected
