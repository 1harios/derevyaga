'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  COOKIE_CONSENT_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_SETTINGS_EVENT,
  readCookieChoice,
  type CookieChoice,
} from '@/lib/cookie-consent'

/**
 * Баннер cookie. Аналитика не запускается до явного согласия: выбор лежит
 * в localStorage и читается инициализатором Метрики (пятая итерация).
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Показываем не в момент загрузки, а через полторы секунды: посетитель успевает
    // увидеть первый экран целиком, и плашка не ложится на то, что он читает
    const timer = window.setTimeout(() => {
      if (!readCookieChoice()) setVisible(true)
    }, 1500)

    const showSettings = () => setVisible(true)
    window.addEventListener(COOKIE_SETTINGS_EVENT, showSettings)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener(COOKIE_SETTINGS_EVENT, showSettings)
    }
  }, [])

  function decide(choice: CookieChoice) {
    const previousChoice = readCookieChoice()
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, choice)
    window.dispatchEvent(new CustomEvent<CookieChoice>(COOKIE_CONSENT_EVENT, { detail: choice }))
    setVisible(false)

    // Уже загруженный сторонний скрипт нельзя надёжно выгрузить из страницы.
    if (previousChoice === 'all' && choice === 'necessary') window.location.reload()
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Использование cookie"
      // Тонкая плашка вдоль нижнего края: не спорит с контентом конкретной страницы
      // (карточка в углу закрывала фото первого экрана и расчёт в калькуляторе).
      // На телефоне поднята над липкой панелью действий.
      className="fixed inset-x-3 bottom-24 z-45 md:inset-x-5 md:bottom-4"
    >
      <div className="card flex flex-col gap-3 rounded-xl p-4 md:flex-row md:items-center md:justify-between md:gap-6 md:px-6 md:py-3">
        <p className="text-[13px] leading-[1.45] md:text-[13.5px]">
          Мы используем cookie: обязательные — чтобы сайт работал, аналитические — чтобы понимать,
          какие страницы полезны.{' '}
          {/* На телефоне вторую фразу прячем — плашка становится на строку короче */}
          <span className="max-md:hidden">Аналитику не включаем без вашего согласия. </span>
          <Link href="/legal/cookie" className="link-underline">
            Политика cookie
          </Link>
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
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
