import { NextResponse } from 'next/server'
import { isAmoConfigured, sendLeadToAmo } from '@/lib/amocrm'

/**
 * Единая точка приёма заявок.
 *
 * Закрыты два слоя: валидация с антиспамом и доставка в amoCRM (сделка
 * с контактом и примечанием — см. src/lib/amocrm.ts). CRM дёргается в фоне
 * после ответа клиенту: заявка к этому моменту уже зафиксирована в логе,
 * поэтому падение CRM не теряет лид и не портит ответ. На третьей итерации
 * добавляются: запись в PostgreSQL, очередь доставки с ретраями и Telegram.
 */

export const runtime = 'nodejs'

type LeadBody = {
  formType?: string
  phone?: string
  name?: string
  comment?: string
  area?: number
  projectSlug?: string
  calculationId?: string
  marketingConsent?: boolean
  companyWebsite?: string
  fillMs?: number
  meta?: Record<string, unknown>
}

const MIN_FILL_MS = 2000
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 5
const DEDUPE_WINDOW_MS = 5 * 60_000

/** Временное хранилище на процесс. На третьей итерации переезжает в базу. */
const rateLimiter = new Map<string, number[]>()
const recentLeads = new Map<string, number>()

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
  let body: LeadBody

  try {
    body = (await request.json()) as LeadBody
  } catch {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 })
  }

  const ip = clientIp(request)

  // Слой 1: ограничение частоты по IP
  if (tooManyRequests(ip)) {
    return NextResponse.json({ error: 'Слишком много попыток, попробуйте через минуту' }, { status: 429 })
  }

  // Слой 2: honeypot. Человек это поле не видит, бот заполняет.
  if (body.companyWebsite) {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  // Слой 3: слишком быстрое заполнение
  if (typeof body.fillMs === 'number' && body.fillMs > 0 && body.fillMs < MIN_FILL_MS) {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  // Валидация на сервере — клиентской не доверяем
  const phone = normalizePhone(body.phone ?? '')
  if (!/^\+7\d{10}$/.test(phone)) {
    return NextResponse.json({ error: 'Проверьте номер телефона' }, { status: 422 })
  }

  const formType = (body.formType ?? 'unknown').slice(0, 64)

  // Идемпотентность: тот же телефон с той же формы в течение 5 минут — не дубль
  const dedupeKey = `${phone}:${formType}`
  const previous = recentLeads.get(dedupeKey)
  const now = Date.now()
  if (previous && now - previous < DEDUPE_WINDOW_MS) {
    return NextResponse.json({ ok: true, duplicate: true })
  }
  recentLeads.set(dedupeKey, now)

  const lead = {
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    formType,
    phone,
    name: body.name?.slice(0, 120),
    comment: body.comment?.slice(0, 2000),
    area: body.area,
    projectSlug: body.projectSlug,
    calculationId: body.calculationId,
    marketingConsent: Boolean(body.marketingConsent),
    ip,
    meta: body.meta ?? {},
  }

  // Сначала фиксируем заявку в логе — это страховка от потери лида,
  // пока нет базы. На третьей итерации здесь появится запись в PostgreSQL
  // и очередь доставки с ретраями.
  console.info('[lead]', JSON.stringify(lead))

  // Доставка в amoCRM. На постоянном сервере (Beget, standalone) — в фоне,
  // после ответа клиенту. На serverless (Vercel, тестовый стенд) функция
  // замораживается сразу после ответа и фоновая задача оборвалась бы,
  // поэтому там доставку ждём до ответа — у адаптера свой таймаут 10 с.
  if (isAmoConfigured()) {
    if (process.env.VERCEL) {
      await sendLeadToAmo(lead)
    } else {
      void sendLeadToAmo(lead)
    }
  }

  return NextResponse.json({ ok: true, leadId: lead.id })
}
