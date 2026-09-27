import type { Project } from '../content/projects'

export type ConstructionObject = {
  id: number
  name: string
  status: 'building' | 'completed'
  lat: number
  lng: number
  location: string
  description: string
  works: string[]
  photos: string[]
  price?: number
  area?: number
  /** Год сдачи — только у построенных домов. */
  year?: number
  /** Slug проекта из каталога, по которому построен дом. */
  project?: string
}

/** Проект каталога в объёме, нужном карточке объекта на карте. */
export type MapProject = Pick<Project, 'slug' | 'name' | 'area' | 'priceFrom' | 'photo' | 'photoAlt'>

export type MapElement = { id: number; name: string; custom_fields_values?: Array<{ field_name: string; values: Array<{ value?: unknown }> }> | null }

export function objectFromElement(element: MapElement): ConstructionObject | null {
  const value = (name: string) => element.custom_fields_values?.find(f => f.field_name === name)?.values?.[0]?.value
  const text = (name: string) => String(value(name) ?? '').trim()
  const number = (name: string) => text(name) ? Number(text(name).replace(',', '.')) : NaN
  if (![true, 1, '1', 'true'].includes(value('Публиковать на сайте') as string)) return null
  const status = text('Статус объекта')
  // Координаты из Яндекс Карт можно вставить парой («60.2555, 29.6030») в поле «Широта».
  const pair = text('Долгота') ? [] : text('Широта').match(/-?\d+(?:[.,]\d+)?/g) ?? []
  const [lat, lng] = pair.length === 2 ? pair.map(part => Number(part.replace(',', '.'))) : [number('Широта'), number('Долгота')]
  if (!element.name.trim() || !['Строится', 'Построен'].includes(status) || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 85 || Math.abs(lng) > 180) return null
  const lines = (name: string) => text(name).split(/\r?\n/).map(s => s.trim()).filter(Boolean)
  const photos = lines('Фотографии').filter(url => {
    if (/^\/(?!\/)/.test(url)) return true
    try { return new URL(url).protocol === 'https:' } catch { return false }
  }).slice(0, 20)
  const price = number('Стоимость, ₽'), area = number('Площадь, м²'), year = number('Год сдачи')
  // Менеджер может вставить slug, путь /projects/slug или полную ссылку на страницу проекта.
  const project = text('Проект на сайте').toLowerCase().replace(/[?#].*$/, '').replace(/\/+$/, '').match(/(?:^|\/projects\/)([a-z0-9-]{2,80})$/)?.[1]
  const completed = status === 'Построен'
  return { id: element.id, name: element.name.trim(), status: completed ? 'completed' : 'building', lat, lng,
    location: text('Населённый пункт'), description: text('Описание'), works: lines('Выполненные работы'), photos,
    price: Number.isFinite(price) && price > 0 ? price : undefined, area: Number.isFinite(area) && area > 0 ? area : undefined,
    year: completed && Number.isInteger(year) && year >= 1990 && year <= 2100 ? year : undefined,
    project }
}

/** Только проекты, на которые ссылаются объекты: в браузер не уходит весь каталог. */
export function linkedProjects(objects: ConstructionObject[], projects: Project[]): MapProject[] {
  const slugs = new Set(objects.map(o => o.project))
  return projects.filter(p => slugs.has(p.slug)).map(({ slug, name, area, priceFrom, photo, photoAlt }) => ({ slug, name, area, priceFrom, photo, photoAlt }))
}

export const mapFields = [
  { name: 'Публиковать на сайте', type: 'checkbox' },
  { name: 'Статус объекта', type: 'select', enums: [{ value: 'Строится', sort: 1 }, { value: 'Построен', sort: 2 }] },
  { name: 'Широта', type: 'text' }, { name: 'Долгота', type: 'text' },
  { name: 'Населённый пункт', type: 'text' }, { name: 'Описание', type: 'textarea' },
  { name: 'Выполненные работы', type: 'textarea' }, { name: 'Фотографии', type: 'textarea' },
  { name: 'Стоимость, ₽', type: 'numeric' }, { name: 'Площадь, м²', type: 'numeric' },
  { name: 'Год сдачи', type: 'numeric' }, { name: 'Проект на сайте', type: 'text' },
].map((field, i) => ({ ...field, sort: 100 + i * 10 }))
