import clsx, { type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

const RUB = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

const NUM = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })

/** 4850000 → «4 850 000 ₽» */
export function formatPrice(value: number): string {
  return RUB.format(Math.round(value)).replace(/ ₽/, ' ₽')
}

/** 4850000 → «4,85 млн ₽» — для узких мест вроде карточек на мобильном */
export function formatPriceShort(value: number): string {
  if (value < 1_000_000) return `${NUM.format(Math.round(value / 1000))} тыс ₽`
  const millions = value / 1_000_000
  return `${millions.toFixed(millions < 10 ? 2 : 1).replace('.', ',')} млн ₽`
}

export function formatNumber(value: number): string {
  return NUM.format(value)
}

/**
 * Русское склонение: plural(5, ['день', 'дня', 'дней']) → «дней»
 */
export function plural(count: number, forms: [string, string, string]): string {
  const n = Math.abs(count) % 100
  const n1 = n % 10
  if (n > 10 && n < 20) return forms[2]
  if (n1 > 1 && n1 < 5) return forms[1]
  if (n1 === 1) return forms[0]
  return forms[2]
}

export function pluralized(count: number, forms: [string, string, string]): string {
  return `${formatNumber(count)} ${plural(count, forms)}`
}

/** «+7 (921) 000-00-00» → «+79210000000» */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (!digits) return ''
  const withoutCountry = digits.replace(/^[78]/, '')
  return `+7${withoutCountry.slice(0, 10)}`
}

/** Маска +7 (___) ___-__-__ поверх пользовательского ввода */
export function formatPhoneMask(input: string): string {
  const digits = input.replace(/\D/g, '').replace(/^[78]/, '').slice(0, 10)
  if (!digits) return ''
  const parts = [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 8),
    digits.slice(8, 10),
  ].filter(Boolean)

  let out = '+7'
  if (parts[0]) out += ` (${parts[0]}`
  if (parts[0] && parts[0].length === 3) out += ')'
  if (parts[1]) out += ` ${parts[1]}`
  if (parts[2]) out += `-${parts[2]}`
  if (parts[3]) out += `-${parts[3]}`
  return out
}

export function isValidPhone(input: string): boolean {
  return /^\+7\d{10}$/.test(normalizePhone(input))
}

/** Телефон для атрибута href="tel:" */
export function telHref(phone: string): string {
  return `tel:${normalizePhone(phone)}`
}
