'use client'

import { useEffect, useRef, useState } from 'react'
import { FaTelegram, FaVk, FaWhatsapp } from 'react-icons/fa6'
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
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewText, setPreviewText] = useState('')
  const readCountRef = useRef(0)
  const chatOpenRef = useRef(false)
  const [showHelp, setShowHelp] = useState(false)
  const audioRef = useRef<AudioContext | null>(null)
  const lastSoundRef = useRef(0)
  // При прокрутке освобождаем место под кнопку возврата наверх.
  const [showTop, setShowTop] = useState(false)
  const launcherRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    // The SDK exposes conversation summaries without accessing iframe DOM.
    const receive = (event: MessageEvent) => {
      const frame = document.querySelector<HTMLIFrameElement>('#amo-livechat iframe')
      if (!frame || event.source !== frame.contentWindow || event.origin !== new URL(frame.src).origin) return
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        if (!['conversations:received', 'conversations:update'].includes(data?.method) || !Array.isArray(data.payload)) return
        const latest = data.payload.map((item: { last_message?: { text?: unknown; created_at?: number } }) => item.last_message)
          .filter((message: { text?: unknown } | undefined) => typeof message?.text === 'string')
          .sort((a: { created_at?: number }, b: { created_at?: number }) => (b.created_at || 0) - (a.created_at || 0))[0]
        if (latest) setPreviewText(latest.text.slice(0, 500))
      } catch { /* Unsupported widget payloads keep the neutral notification. */ }
    }
    window.addEventListener('message', receive)
    return () => window.removeEventListener('message', receive)
  }, [])

  useEffect(() => {
    // Browsers allow notification audio only after a visitor interaction.
    const unlock = () => {
      try {
        audioRef.current ??= new AudioContext()
        if (audioRef.current.state === 'suspended') void audioRef.current.resume().catch(() => {})
      } catch { /* Audio is optional; visual notifications remain available. */ }
    }
    document.addEventListener('pointerdown', unlock)
    document.addEventListener('keydown', unlock)
    return () => {
      document.removeEventListener('pointerdown', unlock)
      document.removeEventListener('keydown', unlock)
      void audioRef.current?.close().catch(() => {})
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('contact-menu-open', isOpen)
    return () => document.documentElement.classList.remove('contact-menu-open')
  }, [isOpen])

  useEffect(() => {
    document.documentElement.classList.toggle('contact-has-unread', unreadCount > 0)
    const showTimer = window.setTimeout(() => setPreviewVisible(unreadCount > 0), 0)
    const timer = window.setTimeout(() => setPreviewVisible(false), 8000)
    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(showTimer)
      document.documentElement.classList.remove('contact-has-unread', 'contact-preview-visible')
    }
  }, [unreadCount])

  useEffect(() => {
    document.documentElement.classList.toggle('contact-scrolled', showTop)
    return () => document.documentElement.classList.remove('contact-scrolled')
  }, [showTop])

  useEffect(() => {
    if (!isReady) return
    let elapsed = 0
    const timer = window.setInterval(() => {
      let seen = false
      try { seen = sessionStorage.getItem('derevyaga.chat-help-seen') === '1' } catch {}
      if (seen) { window.clearInterval(timer); return }
      if (document.hidden || isChatOpen || isOpen || unreadCount > 0 || !launcherRef.current?.getClientRects().length) return
      elapsed += 1
      if (elapsed < 40) return
      setShowHelp(true)
      try { sessionStorage.setItem('derevyaga.chat-help-seen', '1') } catch {}
      window.clearInterval(timer)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [isReady, isChatOpen, isOpen, unreadCount])

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
        chatOpenRef.current = true
        readCountRef.current = Number.parseInt(document.querySelector('.amo-button-greeting-badge')?.textContent || '0', 10) || 0
        setUnreadCount(0)
        setIsOpen(false)
        setIsChatOpen(true)
        setShowHelp(false)
        try { sessionStorage.setItem('derevyaga.chat-help-seen', '1') } catch {}
      })
      window.amoSocialButton?.('onChatHide', () => {
        chatOpenRef.current = false
        setIsChatOpen(false)
      })
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
    let previous = Number.parseInt(badge.textContent || '0', 10) || 0
    const syncUnread = () => {
      const next = Number.parseInt(badge.textContent || '0', 10) || 0
      // amoCRM can retain its old badge count after a conversation is read.
      // Acknowledge that count locally, but allow later increments to notify.
      readCountRef.current = chatOpenRef.current ? next : Math.min(readCountRef.current, next)
      setUnreadCount(chatOpenRef.current ? 0 : Math.max(0, next - readCountRef.current))
      if (next > previous && !chatOpenRef.current) {
        setShowHelp(false)
        const audio = audioRef.current
        if (!document.querySelector('.amo-livechat_chat') && audio?.state === 'running' && Date.now() - lastSoundRef.current > 3000) {
          lastSoundRef.current = Date.now()
          const tone = audio.createOscillator()
          const volume = audio.createGain()
          tone.type = 'sine'
          tone.frequency.setValueAtTime(660, audio.currentTime)
          tone.frequency.setValueAtTime(880, audio.currentTime + .12)
          volume.gain.setValueAtTime(0, audio.currentTime)
          volume.gain.linearRampToValueAtTime(.075, audio.currentTime + .025)
          volume.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .35)
          tone.connect(volume)
          volume.connect(audio.destination)
          tone.start()
          tone.stop(audio.currentTime + .36)
          tone.onended = () => { tone.disconnect(); volume.disconnect() }
        }
      }
      previous = next
    }
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
        <aside className={`${styles.notification} ${previewVisible && unreadCount > 0 && !isOpen && !isChatOpen ? styles.notificationVisible : ''}`} inert={!previewVisible || unreadCount === 0 || isOpen || isChatOpen} aria-hidden={!previewVisible || unreadCount === 0 || isOpen || isChatOpen} aria-label="Новое сообщение в чате">
          <button type="button" className={styles.helpClose} aria-label="Скрыть уведомление" onClick={() => setPreviewVisible(false)}><LuX aria-hidden /></button>
          <div className={styles.notificationTitle}><LuMessageCircleMore aria-hidden /><strong>Вам ответили в чате</strong></div>
          <p>{previewText || 'Новое сообщение от команды Деревяги. Откройте чат, чтобы прочитать ответ.'}</p>
          <button type="button" className={styles.notificationAction} onClick={openOnlineChat}>Открыть чат <span aria-hidden>↗</span></button>
        </aside>
        {showHelp && !isChatOpen && !isOpen && unreadCount === 0 && <aside className={`${styles.notification} ${styles.notificationVisible}`} aria-label="Помощь с выбором дома">
          <button className={styles.helpClose} type="button" aria-label="Скрыть предложение помощи" onClick={() => setShowHelp(false)}><LuX aria-hidden /></button>
          <div className={styles.notificationTitle}><LuMessageCircleMore aria-hidden /><strong>Помочь с выбором дома?</strong></div>
          <p>Напишите в чат — обсудим проект, планировку и стоимость.</p>
          <button type="button" className={styles.notificationAction} onClick={openOnlineChat}>Задать вопрос <span aria-hidden>↗</span></button>
        </aside>}
        <div id="contact-launcher-menu" className={`${styles.menu} ${isOpen ? styles.open : ''}`} inert={!isOpen} aria-hidden={!isOpen}>
          {isReady && <button type="button" className={`${styles.circle} ${unreadCount > 0 ? styles.unread : ''}`} aria-label="Онлайн-чат" title="Онлайн-чат" onClick={openOnlineChat}><LuMessageCircleMore aria-hidden />{unreadCount > 0 && <span className={styles.chatDot} aria-label="Есть новые сообщения" />}</button>}
          <a className={styles.circle} href={telHref(company.phone)} aria-label="Позвонить в Деревягу" title="Позвонить" onClick={() => track('phone_click', { place: 'contact-launcher' })}><LuPhone aria-hidden /></a>
          <a className={styles.circle} href={company.telegram} target="_blank" rel="noopener noreferrer" aria-label="Написать в Telegram" title="Telegram" onClick={() => track('messenger_click', { service: 'telegram' })}><FaTelegram aria-hidden /></a>
          <a className={styles.circle} href={company.max} target="_blank" rel="noopener noreferrer" aria-label="Написать в MAX" title="MAX" onClick={() => track('messenger_click', { service: 'max' })}><Image src="/brand/max-white.svg" alt="" width={26} height={26} /></a>
          <a className={styles.circle} href={company.vk} target="_blank" rel="noopener noreferrer" aria-label="Написать в ВК" title="ВКонтакте" onClick={() => track('messenger_click', { service: 'vk' })}><FaVk aria-hidden /></a>
          <a className={styles.circle} href={company.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Написать в WhatsApp" title="WhatsApp" onClick={() => track('messenger_click', { service: 'whatsapp' })}><FaWhatsapp aria-hidden /></a>
        </div>
        <button ref={triggerRef} type="button" className={`${styles.circle} ${isOpen || isChatOpen ? styles.light : ''} ${!isChatOpen && unreadCount > 0 ? styles.unread : ''}`} aria-label={isChatOpen ? 'Закрыть онлайн-чат' : isOpen ? 'Закрыть способы связи' : 'Открыть способы связи'} aria-expanded={isOpen} aria-controls="contact-launcher-menu" onClick={() => {
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
