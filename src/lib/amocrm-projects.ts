import { projects as fallbackProjects, type Project } from '@/content/projects'
import { siteUrl } from '@/lib/site-url'

type AmoCustomField = {
  id: number
  name: string
  type: string
  code?: string | null
}

type AmoFieldValue = {
  field_id: number
  field_name: string
  field_code?: string | null
  field_type: string
  values: Array<{ value?: unknown; enum_id?: number; enum_code?: string }>
}

type AmoCatalogElement = {
  id: number
  name: string
  custom_fields_values?: AmoFieldValue[] | null
}

type AmoFieldsResponse = {
  _embedded?: { custom_fields?: AmoCustomField[] }
}

type AmoElementsResponse = {
  _embedded?: { elements?: AmoCatalogElement[] }
}

type FieldDefinition = {
  name: string
  type: 'checkbox' | 'numeric' | 'select' | 'text' | 'textarea' | 'url'
  sort: number
  enums?: Array<{ value: string; sort: number }>
}

/** Поля, которыми менеджер управляет карточкой проекта в amoCRM. */
const PROJECT_FIELDS: FieldDefinition[] = [
  { name: 'Публиковать на сайте', type: 'checkbox', sort: 1000 },
  { name: 'Показывать на главной', type: 'checkbox', sort: 1010 },
  { name: 'Адрес страницы', type: 'text', sort: 1020 },
  { name: 'Площадь, м²', type: 'numeric', sort: 1030 },
  {
    name: 'Этажность',
    type: 'select',
    sort: 1040,
    enums: [
      { value: 'Один этаж', sort: 10 },
      { value: 'Два этажа', sort: 20 },
      { value: 'С мансардой', sort: 30 },
    ],
  },
  { name: 'Спальни', type: 'numeric', sort: 1050 },
  { name: 'Санузлы', type: 'numeric', sort: 1060 },
  { name: 'Терраса, м²', type: 'numeric', sort: 1070 },
  { name: 'Срок строительства, дней', type: 'numeric', sort: 1080 },
  {
    name: 'Метка',
    type: 'select',
    sort: 1090,
    enums: [
      { value: 'Хит', sort: 10 },
      { value: 'Новинка', sort: 20 },
    ],
  },
  { name: 'Короткое описание', type: 'textarea', sort: 1100 },
  { name: 'Подробное описание', type: 'textarea', sort: 1110 },
  { name: 'Фото карточки', type: 'url', sort: 1120 },
  { name: 'Подпись к фото', type: 'text', sort: 1130 },
  { name: 'Особенности проекта', type: 'textarea', sort: 1140 },
  { name: 'Фотографии галереи', type: 'textarea', sort: 1150 },
  { name: 'Комплектация и материалы', type: 'textarea', sort: 1160 },
  { name: 'Порядок отображения', type: 'numeric', sort: 1170 },
]

function amoConfigured(): boolean {
  return Boolean(process.env.AMO_DOMAIN && process.env.AMO_TOKEN && process.env.AMO_PROJECTS_CATALOG_ID)
}

function amoConfig(): { domain: string; token: string; catalogId: number } {
  const domain = process.env.AMO_DOMAIN?.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')
  const token = process.env.AMO_TOKEN?.trim()
  const catalogId = Number(process.env.AMO_PROJECTS_CATALOG_ID)

  if (!domain || !token || !Number.isInteger(catalogId) || catalogId <= 0) {
    throw new Error('Не заданы AMO_DOMAIN, AMO_TOKEN или AMO_PROJECTS_CATALOG_ID')
  }

  return { domain, token, catalogId }
}

async function amoRequest(path: string, init?: RequestInit): Promise<Response> {
  const { domain, token } = amoConfig()
  return fetch(`https://${domain}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    cache: 'no-store',
  })
}

async function amoCachedRequest(path: string): Promise<Response> {
  const { domain, token } = amoConfig()
  return fetch(`https://${domain}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 300, tags: ['amo-projects'] },
  })
}

async function responseError(response: Response): Promise<string> {
  try {
    return (await response.text()).slice(0, 1000)
  } catch {
    return ''
  }
}

async function getAmoFields(cached = false): Promise<AmoCustomField[]> {
  const { catalogId } = amoConfig()
  const path = `/api/v4/catalogs/${catalogId}/custom_fields?limit=250&order%5Bsort%5D=asc`
  const response = cached ? await amoCachedRequest(path) : await amoRequest(path)

  if (response.status === 401) {
    throw new Error('AUTH_401: amoCRM отклонила токен — проверьте или перевыпустите AMO_TOKEN')
  }

  if (!response.ok) {
    throw new Error(`amoCRM не вернула поля (${response.status}): ${await responseError(response)}`)
  }

  if (response.status === 204) return []

  const payload = (await response.json()) as AmoFieldsResponse
  return payload._embedded?.custom_fields ?? []
}

async function getAmoElements(cached = false): Promise<AmoCatalogElement[]> {
  const { catalogId } = amoConfig()
  const path = `/api/v4/catalogs/${catalogId}/elements?limit=250`
  const response = cached ? await amoCachedRequest(path) : await amoRequest(path)

  if (response.status === 401) {
    throw new Error('AUTH_401: amoCRM отклонила токен — проверьте или перевыпустите AMO_TOKEN')
  }

  if (!response.ok) {
    throw new Error(`amoCRM не вернула проекты (${response.status}): ${await responseError(response)}`)
  }

  if (response.status === 204) return []

  const payload = (await response.json()) as AmoElementsResponse
  return payload._embedded?.elements ?? []
}

function fieldValue(element: AmoCatalogElement, name: string): unknown {
  const normalizedName = name.toLocaleLowerCase('ru-RU')
  return element.custom_fields_values?.find(
    (field) => field.field_name.trim().toLocaleLowerCase('ru-RU') === normalizedName,
  )?.values?.[0]?.value
}

function codedValue(element: AmoCatalogElement, code: string): unknown {
  return element.custom_fields_values?.find((field) => field.field_code === code)?.values?.[0]?.value
}

function asNumber(value: unknown): number {
  const number = typeof value === 'number' ? value : Number(String(value ?? '').replace(',', '.'))
  return Number.isFinite(number) ? number : 0
}

function asBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true'
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : String(value ?? '').trim()
}

function asLines(value: unknown): string[] {
  return asText(value)
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean)
}

function normalizePhoto(value: unknown): string {
  const photo = asText(value)
  if (!photo) return ''
  if (photo.startsWith('/')) return photo

  try {
    const url = new URL(photo)
    if (
      url.pathname.startsWith('/photos/') &&
      (url.hostname === 'derevyaga.ru' || url.hostname.endsWith('.vercel.app'))
    ) {
      return url.pathname
    }
  } catch {
    return ''
  }

  return photo
}

function projectFromElement(element: AmoCatalogElement): (Project & { order: number }) | null {
  if (!asBoolean(fieldValue(element, 'Публиковать на сайте'))) return null

  const slug = asText(fieldValue(element, 'Адрес страницы') || codedValue(element, 'SKU'))
  const area = asNumber(fieldValue(element, 'Площадь, м²'))
  const priceFrom = asNumber(codedValue(element, 'PRICE') || fieldValue(element, 'Цена'))
  const days = asNumber(fieldValue(element, 'Срок строительства, дней'))
  const photo = normalizePhoto(fieldValue(element, 'Фото карточки'))
  const floorsLabel = asText(fieldValue(element, 'Этажность'))

  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    area <= 0 ||
    priceFrom <= 0 ||
    days <= 0 ||
    !photo ||
    !['Один этаж', 'Два этажа', 'С мансардой'].includes(floorsLabel)
  ) {
    console.warn('[amocrm] опубликованный проект заполнен не полностью', element.id)
    return null
  }

  const rawTag = asText(fieldValue(element, 'Метка'))
  const highlights = asLines(fieldValue(element, 'Особенности проекта'))
  const description = asLines(fieldValue(element, 'Подробное описание'))
  const gallery = asLines(fieldValue(element, 'Фотографии галереи'))
    .map(normalizePhoto)
    .filter(Boolean)
    .map((src, index) => ({
      src,
      alt: `${element.name.trim()} — дополнительный вид дома ${index + 1}`,
    }))

  return {
    slug,
    name: element.name.trim(),
    area,
    floorsLabel,
    bedrooms: asNumber(fieldValue(element, 'Спальни')),
    bathrooms: asNumber(fieldValue(element, 'Санузлы')),
    terrace: asNumber(fieldValue(element, 'Терраса, м²')),
    priceFrom,
    days,
    ...(rawTag === 'Хит' ? { tag: 'hit' as const } : rawTag === 'Новинка' ? { tag: 'new' as const } : {}),
    summary: asText(fieldValue(element, 'Короткое описание')),
    ...(description.length ? { description } : {}),
    photo,
    photoAlt: asText(fieldValue(element, 'Подпись к фото')) || `Каркасный дом «${element.name.trim()}»`,
    ...(gallery.length ? { gallery } : {}),
    highlights: highlights.length ? highlights : ['Планировку адаптируем под ваш участок и состав семьи'],
    showOnHome: asBoolean(fieldValue(element, 'Показывать на главной')),
    order: asNumber(fieldValue(element, 'Порядок отображения')) || 9999,
  }
}

function projectsFromElements(elements: AmoCatalogElement[]): Array<Project & { order: number }> {
  return elements
    .map(projectFromElement)
    .filter((project): project is Project & { order: number } => Boolean(project))
    .sort((a, b) => a.order - b.order || a.priceFrom - b.priceFrom)
}

/** Каталог для страниц сайта. При сбое amoCRM сайт продолжает работать на локальной копии. */
export async function getProjects(): Promise<Project[]> {
  if (!amoConfigured()) return fallbackProjects

  try {
    const elements = await getAmoElements(true)
    const projects = projectsFromElements(elements).map((project) => {
      const publicProject: Project & { order?: number } = { ...project }
      delete publicProject.order
      return publicProject
    })

    return projects.length ? projects : fallbackProjects
  } catch (error) {
    console.error('[amocrm] projects fallback', error instanceof Error ? error.message : error)
    return fallbackProjects
  }
}

export async function ensureAmoProjectCatalogFields(): Promise<{
  catalogId: number
  existing: string[]
  created: string[]
}> {
  const { catalogId } = amoConfig()
  const existingFields = await getAmoFields()
  const existingNames = new Set(existingFields.map((field) => field.name.trim().toLocaleLowerCase('ru-RU')))
  const missingFields = PROJECT_FIELDS.filter(
    (field) => !existingNames.has(field.name.toLocaleLowerCase('ru-RU')),
  )

  if (!missingFields.length) {
    return { catalogId, existing: existingFields.map((field) => field.name), created: [] }
  }

  const createResponse = await amoRequest(`/api/v4/catalogs/${catalogId}/custom_fields`, {
    method: 'POST',
    body: JSON.stringify(missingFields),
  })

  if (!createResponse.ok) {
    throw new Error(`amoCRM не создала поля (${createResponse.status}): ${await responseError(createResponse)}`)
  }

  const createdPayload = (await createResponse.json()) as AmoFieldsResponse
  const createdFields = createdPayload._embedded?.custom_fields ?? []

  return {
    catalogId,
    existing: existingFields.map((field) => field.name),
    created: createdFields.map((field) => field.name),
  }
}

function fieldByName(fields: AmoCustomField[], name: string): AmoCustomField | undefined {
  const normalized = name.toLocaleLowerCase('ru-RU')
  return fields.find((field) => field.name.trim().toLocaleLowerCase('ru-RU') === normalized)
}

function fieldByCode(fields: AmoCustomField[], code: string): AmoCustomField | undefined {
  return fields.find((field) => field.code === code)
}

type AmoSeedFieldValue = {
  field_id: number
  values: Array<{ value: unknown }>
}

function seedValues(fields: AmoCustomField[], project: Project, index: number): AmoSeedFieldValue[] {
  const values: AmoSeedFieldValue[] = []
  const photoOrigin = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : siteUrl

  const add = (field: AmoCustomField | undefined, value: unknown) => {
    if (!field || value === undefined || value === null || value === '') return
    values.push({ field_id: field.id, values: [{ value }] })
  }

  add(fieldByCode(fields, 'SKU') ?? fieldByName(fields, 'Артикул'), project.slug)
  add(fieldByCode(fields, 'PRICE') ?? fieldByName(fields, 'Цена'), project.priceFrom)
  add(fieldByName(fields, 'Публиковать на сайте'), true)
  add(fieldByName(fields, 'Показывать на главной'), true)
  add(fieldByName(fields, 'Адрес страницы'), project.slug)
  add(fieldByName(fields, 'Площадь, м²'), project.area)
  add(fieldByName(fields, 'Этажность'), project.floorsLabel)
  add(fieldByName(fields, 'Спальни'), project.bedrooms)
  add(fieldByName(fields, 'Санузлы'), project.bathrooms)
  add(fieldByName(fields, 'Терраса, м²'), project.terrace)
  add(fieldByName(fields, 'Срок строительства, дней'), project.days)
  add(fieldByName(fields, 'Метка'), project.tag === 'hit' ? 'Хит' : project.tag === 'new' ? 'Новинка' : '')
  add(fieldByName(fields, 'Короткое описание'), project.summary)
  add(fieldByName(fields, 'Подробное описание'), project.description?.join('\n\n'))
  add(fieldByName(fields, 'Фото карточки'), `${photoOrigin}${project.photo}`)
  add(fieldByName(fields, 'Подпись к фото'), project.photoAlt)
  add(fieldByName(fields, 'Особенности проекта'), project.highlights.join('\n'))
  add(
    fieldByName(fields, 'Фотографии галереи'),
    project.gallery?.map((image) => `${photoOrigin}${image.src}`).join('\n'),
  )
  add(fieldByName(fields, 'Порядок отображения'), (index + 1) * 10)

  return values
}

/** Один раз переносит локальные карточки в пустой список amoCRM, не перезаписывая работу менеджера. */
export async function seedAmoProjectCatalog(): Promise<{
  catalogId: number
  existing: string[]
  created: string[]
  published: string[]
}> {
  const { catalogId } = amoConfig()
  await ensureAmoProjectCatalogFields()
  const [fields, elements] = await Promise.all([getAmoFields(), getAmoElements()])

  const existingSlugs = new Set(
    elements.map((element) => asText(fieldValue(element, 'Адрес страницы') || codedValue(element, 'SKU'))),
  )
  const existingNames = new Set(elements.map((element) => element.name.trim().toLocaleLowerCase('ru-RU')))
  const missing = fallbackProjects.filter(
    (project) =>
      !existingSlugs.has(project.slug) && !existingNames.has(project.name.toLocaleLowerCase('ru-RU')),
  )

  if (!missing.length) {
    return {
      catalogId,
      existing: elements.map((element) => element.name),
      created: [],
      published: projectsFromElements(elements).map((project) => project.name),
    }
  }

  const createResponse = await amoRequest(`/api/v4/catalogs/${catalogId}/elements`, {
    method: 'POST',
    body: JSON.stringify(
      missing.map((project) => ({
        name: project.name,
        custom_fields_values: seedValues(fields, project, fallbackProjects.indexOf(project)),
      })),
    ),
  })

  if (!createResponse.ok) {
    throw new Error(`amoCRM не создала проекты (${createResponse.status}): ${await responseError(createResponse)}`)
  }

  const createdPayload = (await createResponse.json()) as AmoElementsResponse
  const created = createdPayload._embedded?.elements?.map((element) => element.name) ?? []
  const savedElements = await getAmoElements()
  return {
    catalogId,
    existing: elements.map((element) => element.name),
    created,
    published: projectsFromElements(savedElements).map((project) => project.name),
  }
}

/** Обновляет только сгенерированные демонстрационные проекты, не затрагивая остальные карточки менеджера. */
export async function syncAmoGeneratedProjects(): Promise<{
  catalogId: number
  updated: string[]
}> {
  const { catalogId } = amoConfig()
  await ensureAmoProjectCatalogFields()
  const [fields, elements] = await Promise.all([getAmoFields(), getAmoElements()])
  const generatedSlugs = new Set(['roshchino-86', 'korela-152'])
  const targets = fallbackProjects.filter((project) => generatedSlugs.has(project.slug))

  const updates = targets.flatMap((project) => {
    const element = elements.find(
      (item) => asText(fieldValue(item, 'Адрес страницы') || codedValue(item, 'SKU')) === project.slug,
    )
    if (!element) return []

    return [{
      id: element.id,
      name: project.name,
      custom_fields_values: seedValues(fields, project, fallbackProjects.indexOf(project)),
    }]
  })

  if (!updates.length) return { catalogId, updated: [] }

  const updateResponse = await amoRequest(`/api/v4/catalogs/${catalogId}/elements`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })

  if (!updateResponse.ok) {
    throw new Error(`amoCRM не обновила проекты (${updateResponse.status}): ${await responseError(updateResponse)}`)
  }

  return { catalogId, updated: targets.map((project) => project.name) }
}
