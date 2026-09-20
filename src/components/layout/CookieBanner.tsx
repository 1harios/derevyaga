'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LuCookie } from 'react-icons/lu'
import styles from './CookieBanner.module.css'
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
  const [error, setError] = useState(false)

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
    try {
      window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, choice)
    } catch {
      setError(true)
      return
    }
    setError(false)
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
      data-cookie-banner
      className={styles.banner}
    >
      <div className={styles.heading}>
        <span className={styles.icon} aria-hidden><LuCookie /></span>
        <h2>Cookie — на ваш выбор</h2>
      </div>
        <p className={styles.text}>
          Обязательные cookie помогают сайту работать. Аналитические — понимать, что вам интересно. Включим аналитику только с вашего согласия.
        </p>
        <Link href="/legal/cookie" className={styles.policy}>Как мы используем cookie</Link>
        <div className={styles.actions}>
          <button type="button" onClick={() => decide('all')} className="btn btn--dark btn--sm">
            Принять всё
          </button>
          <button type="button" onClick={() => decide('necessary')} className="btn btn--outline btn--sm">
            Отказаться
          </button>
        </div>
        {error && <p role="alert" className={styles.error}>Не удалось сохранить выбор. Проверьте настройки хранения данных в браузере и попробуйте ещё раз.</p>}
    </div>
  )
}
