import { mapFields, objectFromElement, type MapElement, type ConstructionObject } from './construction-objects'

function config() {
  const domain = process.env.AMO_DOMAIN?.trim().replace(/^https:\/\//, '').replace(/\/$/, '')
  const token = process.env.AMO_TOKEN?.trim()
  if (!domain || !/^[a-z0-9-]+\.amocrm\.ru$/i.test(domain) || !token) throw new Error('Не настроены AMO_DOMAIN и AMO_TOKEN')
  return { domain, token }
}

async function request(path: string, init?: RequestInit) {
  const { domain, token } = config()
  const response = await fetch(`https://${domain}/api/v4/${path}`, { ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(12000),
    ...(init?.method || init?.cache === 'no-store' ? { cache: 'no-store' as const } : { next: { revalidate: 300, tags: ['amo-construction'] } }),
  })
  if (!response.ok) throw new Error(`amoCRM: HTTP ${response.status}`)
  return response.status === 204 ? {} : response.json()
}

export async function getConstructionObjects(): Promise<{ objects: ConstructionObject[]; state: 'ready' | 'unconfigured' | 'error' }> {
  const id = Number(process.env.AMO_MAP_CATALOG_ID)
  if (!Number.isInteger(id) || id <= 0 || !process.env.AMO_DOMAIN || !process.env.AMO_TOKEN) return { objects: [], state: 'unconfigured' }
  try {
    const objects: ConstructionObject[] = []
    for (let page = 1; page <= 100; page++) {
      const payload = await request(`catalogs/${id}/elements?limit=250&page=${page}`)
      const elements: MapElement[] = payload._embedded?.elements ?? []
      objects.push(...elements.map(objectFromElement).filter((o): o is ConstructionObject => o !== null))
      if (!payload._links?.next || !elements.length) return { objects, state: 'ready' }
    }
    throw new Error('Слишком много страниц объектов')
  } catch (error) {
    console.error('[construction-map]', error instanceof Error ? error.message : 'Ошибка загрузки')
    return { objects: [], state: 'error' }
  }
}

/** Идемпотентная подготовка отдельного списка, без публикации объектов. */
export async function setupConstructionCatalog() {
  let id = Number(process.env.AMO_MAP_CATALOG_ID)
  if (!Number.isInteger(id) || id <= 0) {
    const catalogs = await request('catalogs?limit=250', { cache: 'no-store' })
    id = catalogs._embedded?.catalogs?.find((c: { name: string }) => c.name === 'Объекты на карте')?.id
    if (!id) {
      const created = await request('catalogs', { method: 'POST', body: JSON.stringify([{ name: 'Объекты на карте', type: 'regular', can_add_elements: true }]) })
      id = created._embedded?.catalogs?.[0]?.id
    }
  }
  if (!Number.isInteger(id) || id <= 0) throw new Error('Не удалось определить список объектов')
  const fields = await request(`catalogs/${id}/custom_fields?limit=250`, { cache: 'no-store' })
  const existing = new Set((fields._embedded?.custom_fields ?? []).map((f: { name: string }) => f.name))
  const missing = mapFields.filter(f => !existing.has(f.name))
  if (missing.length) await request(`catalogs/${id}/custom_fields`, { method: 'POST', body: JSON.stringify(missing) })
  return { catalogId: id, createdFields: missing.length }
}
