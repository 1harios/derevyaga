import { normalizePhone } from './utils'

/**
 * Клиентская часть отправки заявки. Здесь только сбор контекста и вызов
 * единой точки приёма POST /api/lead. Никаких обращений к CRM или Telegram
 * из браузера — они живут на сервере.
 */

export type LeadPayload = {
  formType: string
  phone: string
  name?: string
  comment?: string
  area?: number
  projectSlug?: string
  calculationId?: string
  marketingConsent: boolean
  /** Ловушка для ботов: человек не видит и не заполняет это поле */
  companyWebsite?: string
  /** Время заполнения формы, мс. Меньше 2000 — почти наверняка бот */
  fillMs: number
  meta: LeadMeta
}

export type LeadMeta = {
  page: string
  referrer: string
  device: string
  screen: string
  utm: Record<string, string>
  yclid?: string
  gclid?: string
  ymClientId?: string
  timeOnSiteSec: number
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']

const pageOpenedAt = typeof window !== 'undefined' ? Date.now() : 0

export function collectLeadMeta(): LeadMeta {
  if (typeof window === 'undefined') {
    return { page: '', referrer: '', device: '', screen: '', utm: {}, timeOnSiteSec: 0 }
  }

  const params = new URLSearchParams(window.location.search)
  const utm: Record<string, string> = {}
  for (const key of UTM_KEYS) {
    const value = params.get(key) ?? readCookie(key)
    if (value) utm[key] = value
  }

  return {
    page: window.location.pathname + window.location.search,
    referrer: document.referrer,
    device: navigator.userAgent,
    screen: `${window.screen.width}x${window.screen.height}`,
    utm,
    yclid: params.get('yclid') ?? readCookie('yclid') ?? undefined,
    gclid: params.get('gclid') ?? readCookie('gclid') ?? undefined,
    ymClientId: readCookie('_ym_uid') ?? undefined,
    timeOnSiteSec: Math.round((Date.now() - pageOpenedAt) / 1000),
  }
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

export type SubmitResult = { ok: true; leadId?: string } | { ok: false; message: string }

export async function submitLead(payload: LeadPayload): Promise<SubmitResult> {
  // Режим показа вёрстки без сервера: используется только для статичного превью
  if (process.env.NEXT_PUBLIC_DEMO_MODE === '1') {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return { ok: true }
  }

  try {
    const response = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, phone: normalizePhone(payload.phone) }),
    })

    if (!response.ok) {
      return {
        ok: false,
        message: 'Не получилось отправить заявку. Попробуйте ещё раз или позвоните нам.',
      }
    }

    const data = (await response.json()) as { leadId?: string }
    return { ok: true, leadId: data.leadId }
  } catch {
    return {
      ok: false,
      message: 'Похоже, пропала связь. Проверьте интернет или позвоните нам — ответим сразу.',
    }
  }
}
