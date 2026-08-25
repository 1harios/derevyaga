export const ATTRIBUTION_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'yclid',
  'gclid',
] as const

const PREFIX = 'derevyaga.attribution.'

export function captureAttribution(search: URLSearchParams): void {
  if (typeof window === 'undefined') return
  try {
    for (const key of ATTRIBUTION_KEYS) {
      const value = search.get(key)
      if (value) window.sessionStorage.setItem(`${PREFIX}${key}`, value.slice(0, 500))
    }
  } catch {
    // В приватном режиме sessionStorage может быть недоступен — форма всё
    // равно должна работать, просто без сохранения рекламной атрибуции.
  }
}

export function readAttribution(key: (typeof ATTRIBUTION_KEYS)[number]): string | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    return window.sessionStorage.getItem(`${PREFIX}${key}`) ?? undefined
  } catch {
    return undefined
  }
}
