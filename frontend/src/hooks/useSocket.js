/**
 * hooks/useSocket.js
 *
 * Manages a single Socket.io connection for the lifetime of the app.
 * Returns the socket instance and a helper to join named rooms.
 */

import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

let socketInstance = null // Module-level singleton

export function useSocket() {
  const socketRef = useRef(null)

  useEffect(() => {
    // Reuse existing connection if the module is still loaded
    if (!socketInstance) {
      socketInstance = io('/', {
        transports:      ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay:    1000,
      })

      socketInstance.on('connect', () =>
        console.log('[Socket] Connected:', socketInstance.id)
      )
      socketInstance.on('disconnect', (reason) =>
        console.log('[Socket] Disconnected:', reason)
      )
      socketInstance.on('connect_error', (err) =>
        console.warn('[Socket] Connection error:', err.message)
      )
    }

    socketRef.current = socketInstance

    return () => {
      // Don't disconnect on unmount — let the module-level instance persist
      // across page navigations. It will be GC'd when the tab closes.
    }
  }, [])

  const joinRoom = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    }
  }, [])

  const on = useCallback((event, handler) => {
    socketRef.current?.on(event, handler)
    return () => socketRef.current?.off(event, handler)
  }, [])

  const off = useCallback((event, handler) => {
    socketRef.current?.off(event, handler)
  }, [])

  return { socket: socketRef.current, joinRoom, on, off }
}

/**
 * useImpactSocket — subscribes to live impact counter updates.
 * Used by the landing page and charity dashboard.
 */
export function useImpactSocket(onUpdate) {
  const { on } = useSocket()

  useEffect(() => {
    const cleanup = on('impact:updated', onUpdate)
    return cleanup
  }, [on, onUpdate])
}

/**
 * useOrderTracking — subscribes to status updates for a specific order.
 */
export function useOrderTracking(orderId, onStatusChange) {
  const { joinRoom, on, off } = useSocket()

  useEffect(() => {
    if (!orderId) return
    joinRoom('join:order-tracking', { orderId })

    const handler = (data) => {
      if (data.orderId === orderId) onStatusChange(data)
    }
    const cleanup = on('order:status-changed', handler)

    return () => {
      cleanup()
      // No need to emit leave — handled by server on disconnect / GC
    }
  }, [orderId, joinRoom, on, off, onStatusChange])
}
