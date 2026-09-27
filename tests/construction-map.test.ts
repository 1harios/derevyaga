import assert from 'node:assert/strict'
import test from 'node:test'
import { linkedProjects, mapFields, objectFromElement } from '../src/lib/construction-objects'
import { projects } from '../src/content/projects'
import { getConstructionObjects } from '../src/lib/amocrm-construction'

function record(overrides: Record<string, unknown> = {}) {
  return { id: 1, name: 'Дом', custom_fields_values: Object.entries({ 'Публиковать на сайте': true, 'Статус объекта': 'Строится', 'Широта': '60,2', 'Долгота': '30.1', ...overrides }).map(([field_name, value]) => ({ field_name, values: [{ value }] })) }
}
test('не публикует скрытые и неполные записи', () => {
  assert.equal(objectFromElement(record({ 'Публиковать на сайте': false })), null)
  for (const fields of [{ 'Широта': '' }, { 'Широта': '91' }, { 'Долгота': 'NaN' }, { 'Статус объекта': 'Архив' }]) assert.equal(objectFromElement(record(fields)), null)
})
test('читает статус, десятичные координаты, работы и только безопасные фото', () => {
  const result = objectFromElement(record({ 'Статус объекта': 'Построен', 'Фотографии': 'javascript:alert(1)\nhttps://example.com/house.jpg\n//evil.com/a\n/photos/house.png', 'Выполненные работы': 'Фундамент\n\nКаркас', 'Стоимость, ₽': '4500000' }))!
  assert.equal(result.status, 'completed'); assert.equal(result.lat, 60.2)
  assert.deepEqual(result.photos, ['https://example.com/house.jpg', '/photos/house.png'])
  assert.deepEqual(result.works, ['Фундамент', 'Каркас']); assert.equal(result.price, 4500000)
})
test('координаты из Яндекс Карт можно вставить парой в поле «Широта»', () => {
  for (const pair of ['60.2555, 29.6030', '60,2555, 29,6030', '60.2555 29.603']) {
    const result = objectFromElement(record({ 'Широта': pair, 'Долгота': '' }))!
    assert.equal(result.lat, 60.2555, pair); assert.equal(result.lng, 29.603, pair)
  }
  assert.equal(objectFromElement(record({ 'Широта': '60.2555, 29.6030', 'Долгота': '30.1' })), null)
})

test('не превращает пустую цену в нулевую стоимость', () => {
  assert.equal(objectFromElement(record())?.price, undefined)
})

test('год сдачи только у построенного дома', () => {
  assert.equal(objectFromElement(record({ 'Год сдачи': '2025' }))?.year, undefined)
  assert.equal(objectFromElement(record({ 'Статус объекта': 'Построен', 'Год сдачи': '2025' }))?.year, 2025)
  assert.equal(objectFromElement(record({ 'Статус объекта': 'Построен', 'Год сдачи': '25' }))?.year, undefined)
})

test('проект принимает slug, путь или ссылку на страницу проекта', () => {
  for (const value of ['roshchino-86', '/projects/roshchino-86', 'https://derevyaga.ru/projects/Roshchino-86/?utm=1']) {
    assert.equal(objectFromElement(record({ 'Проект на сайте': value }))?.project, 'roshchino-86', value)
  }
  for (const value of ['https://example.com/evil', 'Рощино', '../roshchino-86']) {
    assert.equal(objectFromElement(record({ 'Проект на сайте': value }))?.project, undefined, value)
  }
})

test('в браузер уходят только проекты, на которые ссылаются объекты', () => {
  const object = objectFromElement(record({ 'Проект на сайте': 'roshchino-86' }))!
  assert.deepEqual(linkedProjects([object], projects).map(p => p.slug), ['roshchino-86'])
  assert.deepEqual(Object.keys(linkedProjects([object], projects)[0]).sort(), ['area', 'name', 'photo', 'photoAlt', 'priceFrom', 'slug'])
})

test('новые поля CRM добавляются в конец, не меняя сортировку старых', () => {
  assert.deepEqual(mapFields.slice(-2).map(f => f.name), ['Год сдачи', 'Проект на сайте'])
  assert.equal(mapFields.find(f => f.name === 'Площадь, м²')?.sort, 190)
})

test('загружает страницы CRM и не возвращает скрытые записи', async (t) => {
  const previous = { domain: process.env.AMO_DOMAIN, token: process.env.AMO_TOKEN, id: process.env.AMO_MAP_CATALOG_ID }
  process.env.AMO_DOMAIN = 'example.amocrm.ru'; process.env.AMO_TOKEN = 'test'; process.env.AMO_MAP_CATALOG_ID = '12'
  t.after(() => { for (const [key, val] of [['AMO_DOMAIN', previous.domain], ['AMO_TOKEN', previous.token], ['AMO_MAP_CATALOG_ID', previous.id]]) { if (val === undefined) delete process.env[key!]; else process.env[key!] = val } })
  let calls = 0
  t.mock.method(globalThis, 'fetch', async () => {
    calls++
    return Response.json(calls === 1 ? { _embedded: { elements: [record(), record({ 'Публиковать на сайте': false })] }, _links: { next: { href: 'unused' } } } : { _embedded: { elements: [{ ...record(), id: 2 }] } })
  })
  const result = await getConstructionObjects()
  assert.equal(calls, 2); assert.equal(result.state, 'ready'); assert.deepEqual(result.objects.map(o => o.id), [1, 2])
})
