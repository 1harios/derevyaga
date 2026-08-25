'use client'

import { COOKIE_SETTINGS_EVENT } from '@/lib/cookie-consent'

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}
      className="link-underline text-left"
    >
      Настройки cookie
    </button>
  )
}
