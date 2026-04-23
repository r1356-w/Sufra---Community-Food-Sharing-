/**
 * hooks/useAnimatedCounter.js
 *
 * Smoothly animates a number from its previous value to the new target.
 * Used by the Impact Dashboard to make live counter updates feel alive.
 */

import { useState, useEffect, useRef } from 'react'

export function useAnimatedCounter(target, duration = 1200, decimals = 0) {
  const [current,  setCurrent]  = useState(target)
  const startRef   = useRef(null)
  const prevTarget = useRef(target)
  const frameRef   = useRef(null)

  useEffect(() => {
    // Skip animation on first mount (show value instantly)
    if (prevTarget.current === target) return

    const from = prevTarget.current
    const to   = target
    prevTarget.current = target

    // Cancel any running animation
    if (frameRef.current) cancelAnimationFrame(frameRef.current)

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4)

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp
      const elapsed  = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const value    = from + (to - from) * easeOutQuart(progress)

      setCurrent(+(value.toFixed(decimals)))

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        startRef.current = null
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      startRef.current = null
    }
  }, [target, duration, decimals])

  return current
}
