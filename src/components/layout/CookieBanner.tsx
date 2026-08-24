'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'derevyaga.cookie-consent'

export type CookieChoice = 'all' | 'necessary'

/**
 * Баннер cookie. Аналитика не запускается до явного согласия: выбор лежит
 * в localStorage и читается инициализатором Метрики (пятая итерация).
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!window.localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [])

  function decide(choice: CookieChoice) {
    window.localStorage.setItem(STORAGE_KEY, choice)
    window.dispatchEvent(new CustomEvent('cookie-consent', { detail: choice }))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Использование cookie"
      // На десктопе уводим вправо (слева в первом экране карточки с цифрами),
      // а от нижнего края поднимаем: в правом нижнем углу живёт кнопка чата
      className="fixed inset-x-3 bottom-24 z-45 md:inset-x-auto md:right-5 md:max-w-sm"
    >
      <div className="card rounded-xl p-5">
        <p className="text-[14px] leading-[1.55]">
          Мы используем cookie: обязательные — чтобы сайт работал, аналитические — чтобы понимать,
          какие страницы полезны. Аналитику не включаем без вашего согласия.{' '}
          <Link href="/legal/cookie" className="link-underline">
            Политика cookie
          </Link>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => decide('all')} className="btn btn--dark btn--sm">
            Принять все
          </button>
          <button type="button" onClick={() => decide('necessary')} className="btn btn--outline btn--sm">
            Только обязательные
          </button>
        </div>
      </div>
    </div>
  )
}
