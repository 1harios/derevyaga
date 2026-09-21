'use client'

import { useEffect, useRef, useState } from 'react'
import { FaTelegram, FaWhatsapp } from 'react-icons/fa6'
import { LuArrowUp, LuMessageCircleMore, LuPhone, LuX } from 'react-icons/lu'
import Image from 'next/image'
import { telHref } from '@/lib/utils'
import styles from './AmoChatWidget.module.css'
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
 * Внешний чат загружается после согласия на cookie. Собственная кнопка
 * связи и прямые ссылки доступны сразу, независимо от загрузки amoCRM.
 */
export function AmoChatWidget() {
  const [isReady, setIsReady] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  // При прокрутке освобождаем место под кнопку возврата наверх.
  const [showTop, setShowTop] = useState(false)
  const launcherRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 160)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Сохраняем совместимость с позиционированием внешнего окна amoCRM.
  useEffect(() => {
    document.documentElement.classList.add('contact-launcher-ready')
    return () => document.documentElement.classList.remove('contact-launcher-ready')
  }, [])

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

      window.amoSocialButton?.('onChatReady', () => setIsReady(true))
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
      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isReady) return
    const badge = document.querySelector('.amo-button-greeting-badge')
    if (!badge) return
    const syncUnread = () => setUnreadCount(Number.parseInt(badge.textContent || '0', 10) || 0)
    syncUnread()
    const observer = new MutationObserver(syncUnread)
    observer.observe(badge, { childList: true, characterData: true, subtree: true })
    return () => observer.disconnect()
  }, [isReady])

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

  const closeOnlineChat = () => {
    if (window.amoSocialButton) {
      window.amoSocialButton('runChatHide')
      return
    }

    document.querySelector<HTMLElement>('.amo-button')?.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, view: window }),
    )
  }

  return (
    <div ref={launcherRef} className={`${styles.launcher} ${showTop ? styles.scrolled : ''} ${isChatOpen ? styles.chatOpen : ''}`} data-contact-launcher>
      <div className={styles.controls}>
        <div id="contact-launcher-menu" className={`${styles.menu} ${isOpen ? styles.open : ''}`} inert={!isOpen} aria-hidden={!isOpen}>
          {isReady && <button type="button" className={styles.circle} aria-label="Онлайн-чат" title="Онлайн-чат" onClick={openOnlineChat}><LuMessageCircleMore aria-hidden /></button>}
          <a className={styles.circle} href={company.max} target="_blank" rel="noopener noreferrer" aria-label="Написать в MAX" title="MAX" onClick={() => track('messenger_click', { service: 'max' })}><Image src="/brand/max-white.svg" alt="" width={26} height={26} /></a>
          <a className={styles.circle} href={company.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Написать в WhatsApp" title="WhatsApp" onClick={() => track('messenger_click', { service: 'whatsapp' })}><FaWhatsapp aria-hidden /></a>
          <a className={styles.circle} href={company.telegram} target="_blank" rel="noopener noreferrer" aria-label="Написать в Telegram" title="Telegram" onClick={() => track('messenger_click', { service: 'telegram' })}><FaTelegram aria-hidden /></a>
          <a className={styles.circle} href={telHref(company.phone)} aria-label="Позвонить в Деревягу" title="Позвонить" onClick={() => track('phone_click', { place: 'contact-launcher' })}><LuPhone aria-hidden /></a>
        </div>
        <button ref={triggerRef} type="button" className={`${styles.circle} ${isOpen || isChatOpen ? styles.light : ''}`} aria-label={isChatOpen ? 'Закрыть онлайн-чат' : isOpen ? 'Закрыть способы связи' : 'Открыть способы связи'} aria-expanded={isOpen} aria-controls="contact-launcher-menu" onClick={() => {
          if (isChatOpen) { closeOnlineChat(); return }
          setIsOpen(open => !open)
        }}>
          {isOpen || isChatOpen ? <LuX aria-hidden /> : <LuMessageCircleMore aria-hidden />}
          {!isChatOpen && unreadCount > 0 && <span className={styles.badge} role="status" aria-label={`Непрочитанных сообщений: ${unreadCount}`}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
        </button>
      </div>
      <button type="button" className={`${styles.circle} ${styles.light} ${styles.top}`} aria-label="Наверх страницы" aria-hidden={!showTop} tabIndex={showTop ? 0 : -1} onClick={() => {
        setIsOpen(false)
        window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
      }}><LuArrowUp aria-hidden /></button>
    </div>
  )
}
