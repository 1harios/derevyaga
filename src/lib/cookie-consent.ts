export const COOKIE_CONSENT_STORAGE_KEY = 'derevyaga.cookie-consent'
export const COOKIE_CONSENT_EVENT = 'cookie-consent'
export const COOKIE_SETTINGS_EVENT = 'cookie-settings'

export type CookieChoice = 'all' | 'necessary'

export function readCookieChoice(): CookieChoice | null {
  if (typeof window === 'undefined') return null
  const value = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
  return value === 'all' || value === 'necessary' ? value : null
}
