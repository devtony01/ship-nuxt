import config from 'config'
import io from 'socket.io-client'

import type { User } from 'types'

const socket = io(config.WS_URL, {
  transports: ['websocket'],
  autoConnect: false,
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
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

  socket.on('disconnect', (reason) => {
    console.warn('Socket disconnected:', reason)
    if (reason === 'io server disconnect') {
      // Server disconnected the socket, reconnect manually
      socket.connect()
    }
  })

  socket.on('reconnect', (attemptNumber) => {
    console.warn('Socket reconnected after', attemptNumber, 'attempts')
  })

  socket.on('reconnect_error', (error) => {
    console.error('Socket reconnection error:', error)
  })

  socket.on('reconnect_failed', () => {
    console.error('Socket reconnection failed after all attempts')
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
