import { NextResponse } from 'next/server'
import { isAmoConfigured, sendLeadToAmo } from '@/lib/amocrm'

/**
 * Единая точка приёма заявок: проверяет входные данные, отсекает простой
 * спам и подтверждает успех только после фактической доставки в amoCRM.
 */

export const runtime = 'nodejs'

const MIN_FILL_MS = 2000
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 5
const DEDUPE_WINDOW_MS = 5 * 60_000

/** Временное хранилище на процесс. Для общего лимита между инстансами нужна БД. */
const rateLimiter = new Map<string, number[]>()
const recentLeads = new Map<string, number>()

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function optionalString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') return undefined
  const result = value.trim().slice(0, maxLength)
  return result || undefined
}

function optionalNumber(value: unknown, min: number, max: number): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    return undefined
  }
  return value
}

function sanitizeMeta(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) return {}

  const rawUtm = isRecord(value.utm) ? value.utm : {}
  const utm = Object.fromEntries(
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
      .map((key) => [key, optionalString(rawUtm[key], 500)] as const)
      .filter((entry): entry is readonly [string, string] => Boolean(entry[1])),
  )

  const page = optionalString(value.page, 1000)
  const referrer = optionalString(value.referrer, 1000)
  const device = optionalString(value.device, 500)
  const screen = optionalString(value.screen, 32)
  const yclid = optionalString(value.yclid, 500)
  const gclid = optionalString(value.gclid, 500)
  const ymClientId = optionalString(value.ymClientId, 100)
  const timeOnSiteSec = optionalNumber(value.timeOnSiteSec, 0, 31_536_000)

  return {
    ...(page ? { page } : {}),
    ...(referrer ? { referrer } : {}),
    ...(device ? { device } : {}),
    ...(screen ? { screen } : {}),
    ...(Object.keys(utm).length ? { utm } : {}),
    ...(yclid ? { yclid } : {}),
    ...(gclid ? { gclid } : {}),
    ...(ymClientId ? { ymClientId } : {}),
    ...(timeOnSiteSec !== undefined ? { timeOnSiteSec } : {}),
  }
}

function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (!digits) return ''
  return `+7${digits.replace(/^[78]/, '').slice(0, 10)}`
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() ?? 'unknown'
}

function tooManyRequests(ip: string): boolean {
  const now = Date.now()
  const hits = (rateLimiter.get(ip) ?? []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS)
  hits.push(now)
  rateLimiter.set(ip, hits)
  return hits.length > RATE_LIMIT_MAX
}

export async function POST(request: Request) {
  let parsed: unknown

  try {
    parsed = await request.json()
  } catch {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 })
  }

  if (!isRecord(parsed)) {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 })
  }

  const body = parsed
  const ip = clientIp(request)

  if (tooManyRequests(ip)) {
    return NextResponse.json({ error: 'Слишком много попыток, попробуйте через минуту' }, { status: 429 })
  }

  // Человек не видит это поле, а простые боты обычно заполняют.
  if (optionalString(body.companyWebsite, 500)) {
    return NextResponse.json({ ok: true })
  }

  const fillMs = optionalNumber(body.fillMs, 0, 86_400_000)
  if (fillMs !== undefined && fillMs > 0 && fillMs < MIN_FILL_MS) {
    return NextResponse.json({ ok: true })
  }

  const phone = normalizePhone(optionalString(body.phone, 64) ?? '')
  if (!/^\+7\d{10}$/.test(phone)) {
    return NextResponse.json({ error: 'Проверьте номер телефона' }, { status: 422 })
  }

  const formType = optionalString(body.formType, 64) ?? 'unknown'
  const dedupeKey = `${phone}:${formType}`
  const previous = recentLeads.get(dedupeKey)
  const now = Date.now()
  if (previous && now - previous < DEDUPE_WINDOW_MS) {
    return NextResponse.json({ ok: true, duplicate: true })
  }

  const lead = {
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    formType,
    phone,
    name: optionalString(body.name, 120),
    comment: optionalString(body.comment, 2000),
    area: optionalNumber(body.area, 1, 100_000),
    projectSlug: optionalString(body.projectSlug, 120),
    calculationId: optionalString(body.calculationId, 120),
    marketingConsent: body.marketingConsent === true,
    meta: sanitizeMeta(body.meta),
  }

  // В лог не пишем телефон, IP, комментарий и прочие персональные данные.
  console.info('[lead] received', {
    id: lead.id,
    receivedAt: lead.receivedAt,
    formType: lead.formType,
  })

  if (!isAmoConfigured()) {
    console.error('[lead] delivery is not configured', { id: lead.id })
    return NextResponse.json(
      { error: 'Сервис заявок временно недоступен. Позвоните нам — ответим сразу.' },
      { status: 503 },
    )
  }

  const delivered = await sendLeadToAmo(lead)
  if (!delivered) {
    return NextResponse.json(
      { error: 'Не получилось отправить заявку. Позвоните нам или попробуйте ещё раз.' },
      { status: 502 },
    )
  }

  // Запоминаем заявку как дубль только после успешной доставки.
  recentLeads.set(dedupeKey, now)
  return NextResponse.json({ ok: true, leadId: lead.id })
}
