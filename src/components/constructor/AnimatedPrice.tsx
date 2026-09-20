'use client'

import { useEffect, useRef, useState } from 'react'
import { formatPrice } from '@/lib/utils'

/** The same ease-out as the home counters, starting from the currently visible price. */
export function AnimatedPrice({ value }: { value: number }) {
  const [display, setDisplay] = useState(value)
  const current = useRef(value)

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    const from = current.current
    const start = performance.now()
    const update = (amount: number) => {
      current.current = amount
      setDisplay(amount)
    }
    const finish = () => {
      cancelAnimationFrame(frame)
      update(value)
    }
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 750)
      const eased = 1 - Math.pow(1 - progress, 3)
      update(Math.round(from + (value - from) * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    const onMotionChange = () => { if (motion.matches) finish() }
    if (motion.matches || from === value) finish()
    else frame = requestAnimationFrame(tick)
    motion.addEventListener('change', onMotionChange)
    return () => {
      cancelAnimationFrame(frame)
      motion.removeEventListener('change', onMotionChange)
    }
  }, [value])

  return <span className="constructor-animated-price" style={{ fontVariantNumeric: 'tabular-nums' }}>
    <span aria-hidden="true">{formatPrice(display)}</span>
    <span className="sr-only">{formatPrice(value)}</span>
  </span>
}
