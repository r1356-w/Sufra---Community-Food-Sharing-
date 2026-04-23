/**
 * context/CartContext.jsx
 *
 * Manages the cart state — crucially separating regularItems from
 * suspendedItems (donated meals). This separation maps directly to the
 * Order schema on the backend.
 *
 * State shape:
 *  regularItems   : [{ menuItemId, name, quantity, unitPrice, image, category }]
 *  suspendedItems : [{ ...same fields, isDonation: true }]
 *  sharedDeliveryOptIn : boolean
 */

import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const CartContext = createContext(null)

const DELIVERY_FEE     = 2.50
const SHARED_DISCOUNT  = 1.00

export function CartProvider({ children }) {
  const [regularItems,        setRegularItems]        = useState([])
  const [suspendedItems,      setSuspendedItems]       = useState([])
  const [sharedDeliveryOptIn, setSharedDeliveryOptIn] = useState(false)
  const [sharedDeliveryMatch, setSharedDeliveryMatch] = useState(null) // From API check

  // ── Helpers ───────────────────────────────────────────────────────────────

  const upsertItem = (list, setList, item) => {
    setList((prev) => {
      const idx = prev.findIndex((i) => i.menuItemId === item.menuItemId)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + (item.quantity || 1) }
        return updated
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }]
    })
  }

  const removeItem = (list, setList, menuItemId) => {
    setList((prev) => prev.filter((i) => i.menuItemId !== menuItemId))
  }

  const changeQty = (list, setList, menuItemId, delta) => {
    setList((prev) =>
      prev
        .map((i) => i.menuItemId === menuItemId ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0)
    )
  }

  // ── Public actions ────────────────────────────────────────────────────────

  const addRegularItem = useCallback((item) => {
    upsertItem(regularItems, setRegularItems, item)
  }, [regularItems])

  const addSuspendedItem = useCallback((item) => {
    upsertItem(suspendedItems, setSuspendedItems, { ...item, isDonation: true })
  }, [suspendedItems])

  const removeRegularItem = useCallback((id) => {
    removeItem(regularItems, setRegularItems, id)
  }, [regularItems])

  const removeSuspendedItem = useCallback((id) => {
    removeItem(suspendedItems, setSuspendedItems, id)
  }, [suspendedItems])

  const updateRegularQty = useCallback((id, delta) => {
    changeQty(regularItems, setRegularItems, id, delta)
  }, [regularItems])

  const updateSuspendedQty = useCallback((id, delta) => {
    changeQty(suspendedItems, setSuspendedItems, id, delta)
  }, [suspendedItems])

  const clearCart = useCallback(() => {
    setRegularItems([])
    setSuspendedItems([])
    setSharedDeliveryOptIn(false)
    setSharedDeliveryMatch(null)
  }, [])

  // ── Computed values ────────────────────────────────────────────────────────

  const pricing = useMemo(() => {
    const subtotal      = regularItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
    const donationTotal = suspendedItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
    const discount      = sharedDeliveryOptIn && sharedDeliveryMatch ? SHARED_DISCOUNT : 0
    const total         = Math.max(0, subtotal + donationTotal + DELIVERY_FEE - discount)

    return {
      subtotal:       +subtotal.toFixed(2),
      donationTotal:  +donationTotal.toFixed(2),
      deliveryFee:    DELIVERY_FEE,
      sharedDiscount: +discount.toFixed(2),
      total:          +total.toFixed(2),
    }
  }, [regularItems, suspendedItems, sharedDeliveryOptIn, sharedDeliveryMatch])

  const totalItems = regularItems.reduce((n, i) => n + i.quantity, 0)
    + suspendedItems.reduce((n, i) => n + i.quantity, 0)

  const isEmpty = regularItems.length === 0 && suspendedItems.length === 0

  const value = {
    regularItems,
    suspendedItems,
    sharedDeliveryOptIn,
    sharedDeliveryMatch,
    pricing,
    totalItems,
    isEmpty,
    addRegularItem,
    addSuspendedItem,
    removeRegularItem,
    removeSuspendedItem,
    updateRegularQty,
    updateSuspendedQty,
    setSharedDeliveryOptIn,
    setSharedDeliveryMatch,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
