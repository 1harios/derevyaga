type AmoCustomField = {
  id: number
  name: string
  type: string
  code?: string | null
}

type AmoFieldsResponse = {
  _embedded?: {
    custom_fields?: AmoCustomField[]
  }
}

type FieldDefinition = {
  name: string
  type: 'checkbox' | 'numeric' | 'select' | 'text' | 'textarea' | 'url'
  sort: number
  enums?: Array<{ value: string; sort: number }>
}

/**
 * Поля, которыми менеджер управляет карточкой проекта в amoCRM.
 * Название, цена и артикул уже есть в товарном каталоге amoCRM.
 */
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
  { name: 'Фото карточки', type: 'url', sort: 1110 },
  { name: 'Подпись к фото', type: 'text', sort: 1120 },
  { name: 'Особенности проекта', type: 'textarea', sort: 1130 },
  { name: 'Фотографии галереи', type: 'textarea', sort: 1140 },
  { name: 'Комплектация и материалы', type: 'textarea', sort: 1150 },
  { name: 'Порядок отображения', type: 'numeric', sort: 1160 },
]

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

async function responseError(response: Response): Promise<string> {
  try {
    return (await response.text()).slice(0, 1000)
  } catch {
    return ''
  }
}

export async function ensureAmoProjectCatalogFields(): Promise<{
  catalogId: number
  existing: string[]
  created: string[]
}> {
  const { catalogId } = amoConfig()
  const fieldsResponse = await amoRequest(
    `/api/v4/catalogs/${catalogId}/custom_fields?limit=250&order%5Bsort%5D=asc`,
  )

  if (!fieldsResponse.ok) {
    throw new Error(`amoCRM не вернула поля (${fieldsResponse.status}): ${await responseError(fieldsResponse)}`)
  }

  const fieldsPayload = (await fieldsResponse.json()) as AmoFieldsResponse
  const existingFields = fieldsPayload._embedded?.custom_fields ?? []
  const existingNames = new Set(existingFields.map((field) => field.name.trim().toLocaleLowerCase('ru-RU')))
  const missingFields = PROJECT_FIELDS.filter(
    (field) => !existingNames.has(field.name.toLocaleLowerCase('ru-RU')),
  )

  if (!missingFields.length) {
    return {
      catalogId,
      existing: existingFields.map((field) => field.name),
      created: [],
    }
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
