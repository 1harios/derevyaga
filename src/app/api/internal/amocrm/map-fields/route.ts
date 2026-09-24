import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { setupConstructionCatalog } from '@/lib/amocrm-construction'

export const runtime = 'nodejs'
export async function POST(request: Request) {
  const expected = process.env.AMO_ADMIN_SECRET, supplied = request.headers.get('x-admin-secret')
  if (!expected || !supplied || Buffer.byteLength(expected) !== Buffer.byteLength(supplied) || !timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))) {
    return NextResponse.json({ error: 'Недостаточно прав' }, { status: 401 })
  }
  try { return NextResponse.json(await setupConstructionCatalog()) }
  catch (error) {
    console.error('[construction-map] setup', error instanceof Error ? error.message : 'Ошибка')
    return NextResponse.json({ error: 'Не удалось настроить список amoCRM. Проверьте доступ и журнал сервера.' }, { status: 502 })
  }
}
