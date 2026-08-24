'use client'

import { useEffect } from 'react'
import { amoChatSnippet } from '@/content/integrations'

/**
 * Онлайн-чат amoCRM («Кнопка на сайт»). Диалоги падают прямо в amoCRM:
 * менеджер отвечает из карточки, переписка сохраняется у сделки.
 *
 * Компонент исполняет код кнопки из src/content/integrations.ts как есть —
 * формат сниппета у amoCRM свой у каждого аккаунта, поэтому мы не собираем
 * его по кусочкам, а вставляем скопированный из кабинета целиком.
 * Пустой сниппет и режим статического превью — чат выключен.
 */
export function AmoChatWidget() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === '1') return
    if (document.getElementById('amo-chat-snippet')) return

    // Кабинет amo отдаёт код в режиме «встраивается в приложение»: кнопка
    // скрыта (Config.hidden) и позиционируется под приложение (inline).
    // На сайте эти флаги не нужны — вырезаем, иначе кнопки не видно.
    // Расположение кнопки и окна чата задано в globals.css (.amo-…).
    const code = amoChatSnippet
      .replace(/<\/?script[^>]*>/gi, '')
      .split(`a[o+'Config']=a[o+'Config']||{};a[o+'Config'].hidden=!0;`)
      .join('')
      .split('inline:true,')
      .join('')
      .trim()
    if (!code) return

    // Внешний вид чата в фирменных цветах сайта — официальный конфиг
    // amoCRM (CRM Plugin API). Должен существовать до исполнения кода кнопки.
    ;(window as typeof window & { amoSocialButtonConfig?: unknown }).amoSocialButtonConfig = {
      hidden: false,
      color: '#4e6254', // кнопка — фирменный «мох»
      onlinechat: {
        locale: {
          extends: 'ru',
          compose_placeholder: 'Напишите ваш вопрос…',
        },
        theme: {
          background: '#ffffff',
          header: { background: '#1e2521', color: '#ffffff' },
          message: {
            outgoing_background: '#4e6254',
            outgoing_color: '#ffffff',
            incoming_background: '#f2f1ef',
            incoming_color: '#1b211d',
          },
          compose: { button_background: '#1e2521' },
        },
      },
    }

    const script = document.createElement('script')
    script.id = 'amo-chat-snippet'
    script.textContent = code
    document.body.appendChild(script)
  }, [])

  return null
}
