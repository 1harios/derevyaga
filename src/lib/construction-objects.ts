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
}

export type MapElement = { id: number; name: string; custom_fields_values?: Array<{ field_name: string; values: Array<{ value?: unknown }> }> | null }

export function objectFromElement(element: MapElement): ConstructionObject | null {
  const value = (name: string) => element.custom_fields_values?.find(f => f.field_name === name)?.values?.[0]?.value
  const text = (name: string) => String(value(name) ?? '').trim()
  const number = (name: string) => text(name) ? Number(text(name).replace(',', '.')) : NaN
  if (![true, 1, '1', 'true'].includes(value('Публиковать на сайте') as string)) return null
  const status = text('Статус объекта')
  const lat = number('Широта'), lng = number('Долгота')
  if (!element.name.trim() || !['Строится', 'Построен'].includes(status) || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 85 || Math.abs(lng) > 180) return null
  const lines = (name: string) => text(name).split(/\r?\n/).map(s => s.trim()).filter(Boolean)
  const photos = lines('Фотографии').filter(url => {
    if (/^\/(?!\/)/.test(url)) return true
    try { return new URL(url).protocol === 'https:' } catch { return false }
  }).slice(0, 20)
  const price = number('Стоимость, ₽'), area = number('Площадь, м²')
  return { id: element.id, name: element.name.trim(), status: status === 'Построен' ? 'completed' : 'building', lat, lng,
    location: text('Населённый пункт'), description: text('Описание'), works: lines('Выполненные работы'), photos,
    price: Number.isFinite(price) && price > 0 ? price : undefined, area: Number.isFinite(area) && area > 0 ? area : undefined }
}

export const mapFields = [
  { name: 'Публиковать на сайте', type: 'checkbox' },
  { name: 'Статус объекта', type: 'select', enums: [{ value: 'Строится', sort: 1 }, { value: 'Построен', sort: 2 }] },
  { name: 'Широта', type: 'text' }, { name: 'Долгота', type: 'text' },
  { name: 'Населённый пункт', type: 'text' }, { name: 'Описание', type: 'textarea' },
  { name: 'Выполненные работы', type: 'textarea' }, { name: 'Фотографии', type: 'textarea' },
  { name: 'Стоимость, ₽', type: 'numeric' }, { name: 'Площадь, м²', type: 'numeric' },
].map((field, i) => ({ ...field, sort: 100 + i * 10 }))
