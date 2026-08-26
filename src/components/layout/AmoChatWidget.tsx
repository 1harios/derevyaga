'use client'

import { useEffect, useRef, useState } from 'react'
import { company } from '@/content/company'
import { amoChatSnippet } from '@/content/integrations'
import { track } from '@/lib/analytics'
import { COOKIE_CONSENT_EVENT, readCookieChoice, type CookieChoice } from '@/lib/cookie-consent'

declare global {
  interface Window {
    amoSocialButton?: (method: string, callback?: (...args: unknown[]) => void) => void
  }
}

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
  const [isReady, setIsReady] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const launcherRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === '1') return

    const mount = () => {
      if (document.getElementById('amo-chat-snippet')) return

      // Кабинет amo отдаёт код в режиме «встраивается в приложение»: кнопка
      // скрыта (Config.hidden) и позиционируется под приложение (inline).
      // На сайте эти флаги не нужны — вырезаем, иначе кнопки не видно.
      const code = amoChatSnippet
        .replace(/<\/?script[^>]*>/gi, '')
        .split(`a[o+'Config']=a[o+'Config']||{};a[o+'Config'].hidden=!0;`)
        .join('')
        .split('inline:true,')
        .join('')
        .trim()
      if (!code) return

      ;(window as typeof window & { amoSocialButtonConfig?: unknown }).amoSocialButtonConfig = {
        hidden: false,
        color: '#4e6254',
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

      window.amoSocialButton?.('onChatReady', () => {
        document.documentElement.classList.add('contact-launcher-ready')
        setIsReady(true)
      })
      window.amoSocialButton?.('onChatShow', () => {
        setIsOpen(false)
        setIsChatOpen(true)
      })
      window.amoSocialButton?.('onChatHide', () => setIsChatOpen(false))
    }

    const onConsent = (event: Event) => {
      if ((event as CustomEvent<CookieChoice>).detail === 'all') mount()
    }

    if (readCookieChoice() === 'all') mount()
    window.addEventListener(COOKIE_CONSENT_EVENT, onConsent)
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, onConsent)
      document.documentElement.classList.remove('contact-launcher-ready')
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!launcherRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  if (!isReady) return null

  const openOnlineChat = () => {
    setIsOpen(false)
    track('chat_open')
    if (window.amoSocialButton) {
      window.amoSocialButton('runChatShow')
      return
    }

    // В отдельных браузерах amoCRM убирает публичную функцию после запуска.
    // Тогда открываем чат через его штатную кнопку, оставленную в DOM.
    document.querySelector<HTMLElement>('.amo-button')?.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, view: window }),
    )
  }

  return (
    <div
      ref={launcherRef}
      className={`contact-launcher${isChatOpen ? ' contact-launcher--chat-open' : ''}`}
    >
      <div id="contact-launcher-menu" className={`contact-launcher__menu${isOpen ? ' is-open' : ''}`}>
        <div className="contact-launcher__heading">
          <strong>Связаться с нами</strong>
          <span>Выберите удобный способ</span>
        </div>

        <div className="contact-launcher__options">
          <a
            href={company.vk}
            target="_blank"
            rel="noreferrer"
            className="contact-launcher__option"
            onClick={() => track('messenger_click', { service: 'vk' })}
          >
            <span className="contact-launcher__service-icon" aria-hidden>ВК</span>
            <span className="contact-launcher__option-copy">
              <strong>ВКонтакте</strong>
              <small>Сообщения сообщества</small>
            </span>
            <span className="contact-launcher__option-arrow" aria-hidden>↗</span>
          </a>
          <a
            href={company.telegram}
            target="_blank"
            rel="noreferrer"
            className="contact-launcher__option"
            onClick={() => track('messenger_click', { service: 'telegram' })}
          >
            <span className="contact-launcher__service-icon" aria-hidden>ТГ</span>
            <span className="contact-launcher__option-copy">
              <strong>Телеграм</strong>
              <small>Перейти в мессенджер</small>
            </span>
            <span className="contact-launcher__option-arrow" aria-hidden>↗</span>
          </a>
          <button type="button" className="contact-launcher__option" onClick={openOnlineChat}>
            <span className="contact-launcher__service-icon" aria-hidden>•••</span>
            <span className="contact-launcher__option-copy">
              <strong>Онлайн-чат</strong>
              <small>Ответим прямо на сайте</small>
            </span>
            <span className="contact-launcher__option-arrow" aria-hidden>→</span>
          </button>
        </div>
      </div>

      <button
        type="button"
        className={`contact-launcher__trigger${isOpen ? ' is-open' : ''}`}
        aria-label={isOpen ? 'Закрыть способы связи' : 'Открыть способы связи'}
        aria-expanded={isOpen}
        aria-controls="contact-launcher-menu"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="contact-launcher__bubble" aria-hidden><i /><i /><i /></span>
      </button>
    </div>
  )
}
