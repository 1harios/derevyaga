'use client'

import { useEffect } from 'react'

/**
 * Глобальный наблюдатель scroll-анимаций. Элементы с атрибутом data-reveal
 * плавно проявляются при входе в вьюпорт; каскад задаётся переменной
 * --reveal-delay прямо на элементе.
 *
 * Скрывающие стили включаются только классом js-reveal на <html> (его ставит
 * инлайновый скрипт в layout до первой отрисовки), поэтому без JavaScript
 * контент остаётся видимым. На случай сбоя наблюдателя стоит страховка:
 * через 3 секунды всё непоказанное проявляется принудительно.
 */
export function RevealObserver() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (!elements.length) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            io.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    )

    elements.forEach((el) => io.observe(el))

    const failsafe = window.setTimeout(() => {
      elements.forEach((el) => el.classList.add('is-in'))
    }, 3000)

    return () => {
      io.disconnect()
      window.clearTimeout(failsafe)
    }
  }, [])

  return null
}
