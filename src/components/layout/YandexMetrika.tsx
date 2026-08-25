'use client'

import { useEffect } from 'react'
import { COOKIE_CONSENT_EVENT, readCookieChoice, type CookieChoice } from '@/lib/cookie-consent'

const COUNTER_ID = Number(process.env.NEXT_PUBLIC_YM_COUNTER_ID ?? 0)

type YmStub = NonNullable<Window['ym']> & { a?: unknown[][]; l?: number }

export function YandexMetrika() {
  useEffect(() => {
    if (!COUNTER_ID || process.env.NEXT_PUBLIC_DEMO_MODE === '1') return

    const initialize = () => {
      if (window.__derevyagaMetrikaInitialized) return
      window.__derevyagaMetrikaInitialized = true

      if (!window.ym) {
        const stub = ((...args: unknown[]) => {
          stub.a ??= []
          stub.a.push(args)
        }) as YmStub
        stub.l = Date.now()
        window.ym = stub
      }

      window.ym(COUNTER_ID, 'init', {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: false,
      })

      for (const [event, params] of window.__derevyagaEventQueue ?? []) {
        window.ym(COUNTER_ID, 'reachGoal', event, params)
      }
      window.__derevyagaEventQueue = []

      if (!document.getElementById('yandex-metrika')) {
        const script = document.createElement('script')
        script.id = 'yandex-metrika'
        script.async = true
        script.src = 'https://mc.yandex.ru/metrika/tag.js'
        document.head.appendChild(script)
      }
    }

    const onConsent = (event: Event) => {
      if ((event as CustomEvent<CookieChoice>).detail === 'all') initialize()
    }

    if (readCookieChoice() === 'all') initialize()
    window.addEventListener(COOKIE_CONSENT_EVENT, onConsent)
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsent)
  }, [])

  return null
}
