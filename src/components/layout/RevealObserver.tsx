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
 * Скрывающие стили включаются только классом js-reveal на <html>. Раньше его
 * ставил инлайновый скрипт до первой отрисовки — и первый экран (заголовок,
 * подводка, фото) оставался невидимым до гидрации React: на слабых телефонах
 * это секунды серой панели и LCP, равный времени интерактивности. Теперь
 * класс ставит сам наблюдатель, предварительно пометив показанными всё,
 * что уже в первом экране: оно видно с первой отрисовки, а анимируется
 * только то, что ниже фолда. Без JavaScript контент виден целиком.
 * На случай сбоя наблюдателя стоит страховка: каждая партия элементов
 * через 3 секунды проявляется принудительно.
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

      /* Страховка от сбоя наблюдателя: принудительно проявляем только то,
         что уже в вьюпорте или выше него. Секции ниже экрана продолжают
         ждать прокрутки — иначе их анимация проигрывалась заранее. */
      const failsafe = window.setTimeout(() => {
        batch.forEach((el) => {
          if (el.classList.contains('is-in')) return
          if (el.getBoundingClientRect().top < window.innerHeight * 1.1) {
            el.classList.add('is-in')
          }
        })
        timers.delete(failsafe)
      }, 3000)
      timers.add(failsafe)
    }

    // Первый проход — ДО включения скрывающих стилей: всё, что уже попадает
    // в первый экран, помечаем показанным без анимации, затем включаем
    // js-reveal (на один кадр без transition, чтобы элементы ниже фолда
    // не «гасли» плавно у тех, кто успел прокрутить страницу).
    const html = document.documentElement
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 1.1) {
        el.classList.add('is-in')
      }
    })
    html.classList.add('js-reveal', 'js-reveal-init')
    const initFrame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => html.classList.remove('js-reveal-init'))
    })

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
      window.cancelAnimationFrame(initFrame)
      timers.forEach((timer) => window.clearTimeout(timer))
      html.classList.remove('js-reveal', 'js-reveal-init')
    }
  }, [])

  return null
}
