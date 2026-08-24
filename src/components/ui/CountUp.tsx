'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Пересчёт числа: при появлении в вьюпорте значение сбрасывается и с
 * замедлением докручивается до финального. Без JavaScript и при
 * prefers-reduced-motion сразу показывается финальное значение —
 * оно же отрендерено на сервере, так что вёрстка не прыгает.
 */
export function CountUp({
  value,
  duration = 1500,
  className,
}: {
  value: number
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(value)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return
        started.current = true
        io.disconnect()

        const start = performance.now()
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration)
          // easeOutCubic: быстро в начале, мягкое торможение у финала
          const eased = 1 - Math.pow(1 - progress, 3)
          setDisplay(Math.round(value * eased))
          if (progress < 1) requestAnimationFrame(tick)
        }
        setDisplay(0)
        requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [value, duration])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
