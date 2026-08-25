'use client'

import { useEffect } from 'react'

/**
 * Глобальный наблюдатель scroll-анимаций. Элементы с атрибутом data-reveal
 * плавно проявляются при входе в вьюпорт; каскад задаётся переменной
 * --reveal-delay прямо на элементе.
 *
 * Компонент живёт в корневом layout и переживает клиентские переходы между
 * страницами, поэтому одного прохода по DOM недостаточно: новые элементы,
 * появившиеся после навигации или перерисовки, ловит MutationObserver и
 * тут же ставит под наблюдение. Без этого текст на новых страницах
 * оставался скрытым (opacity 0) до перезагрузки.
 *
 * Скрывающие стили включаются только классом js-reveal на <html> (его ставит
 * инлайновый скрипт в layout до первой отрисовки), поэтому без JavaScript
 * контент остаётся видимым. На случай сбоя наблюдателя стоит страховка:
 * каждая партия элементов через 3 секунды проявляется принудительно.
 */
export function RevealObserver() {
  useEffect(() => {
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

    const timers = new Set<number>()

    /** Ставит под наблюдение все непоказанные data-reveal внутри узла */
    const track = (root: HTMLElement | Document) => {
      const batch: HTMLElement[] = []
      if (root instanceof HTMLElement && root.matches('[data-reveal]:not(.is-in)')) {
        batch.push(root)
      }
      root.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)').forEach((el) => {
        batch.push(el)
      })
      if (!batch.length) return

      batch.forEach((el) => io.observe(el))

      const failsafe = window.setTimeout(() => {
        batch.forEach((el) => el.classList.add('is-in'))
        timers.delete(failsafe)
      }, 3000)
      timers.add(failsafe)
    }

    track(document)

    // Новые элементы после клиентской навигации или перерисовки
    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            track(node as HTMLElement)
          }
        })
      }
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  return null
}
