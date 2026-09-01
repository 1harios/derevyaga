import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { ensureAmoProjectCatalogFields, seedAmoProjectCatalog } from '@/lib/amocrm-projects'

export const runtime = 'nodejs'

function isAuthorized(request: Request): boolean {
  const expected = process.env.AMO_ADMIN_SECRET
  const provided = request.headers.get('x-admin-secret')

  if (!expected || !provided) return false

  const expectedBuffer = Buffer.from(expected)
  const providedBuffer = Buffer.from(provided)
  return expectedBuffer.length === providedBuffer.length && timingSafeEqual(expectedBuffer, providedBuffer)
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Недостаточно прав' }, { status: 401 })
  }

  try {
    const result = await ensureAmoProjectCatalogFields()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('[amocrm] project fields bootstrap failed', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Не удалось настроить поля amoCRM' },
      { status: 502 },
    )
  }
}

export async function PUT(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Недостаточно прав' }, { status: 401 })
  }

  try {
    const result = await seedAmoProjectCatalog()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('[amocrm] project seed failed', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Не удалось перенести проекты в amoCRM' },
      { status: 502 },
    )
  }
}
