import assert from 'node:assert/strict'
import test from 'node:test'
import { objectFromElement } from '../src/lib/construction-objects'
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
test('не превращает пустую цену в нулевую стоимость', () => {
  assert.equal(objectFromElement(record())?.price, undefined)
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
