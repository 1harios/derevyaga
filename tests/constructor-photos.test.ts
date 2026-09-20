import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { houseDimensions, insulationPhoto, photoLayers, photoScene } from '../src/components/constructor/photo-scenes'
import { constructorConfig as cfg } from '../src/lib/constructor/config'
import { defaultConstructorInput } from '../src/lib/constructor/engine'

test('all facade, terrace, roof and foundation combinations resolve to available approved assets', () => {
  const checked = new Set<string>()
  for (const size of cfg.sizes) for (const facade of cfg.facades) for (const terrace of [true, false]) {
    for (const roof of cfg.roofs) for (const foundation of cfg.foundations) {
      const input = { ...defaultConstructorInput, size: size.id, facade: facade.id, terrace, roof: roof.id, foundation: foundation.id }
      const layers = photoLayers(input)
      assert.ok(layers.roof.endsWith(`/roof-${roof.id}.webp`))
      if (facade.id !== 'timber') assert.ok(layers.base.endsWith(`/facade-${facade.id}${terrace ? '' : '-entry'}.webp`))
      else assert.ok(layers.base.endsWith(terrace ? '/base.webp' : '/terrace-no.webp'))
      assert.equal(layers.foundation === null, foundation.id === 'screw')
      for (const src of Object.values(layers)) if (src) checked.add(src)
    }
  }
  for (const src of checked) assert.ok(existsSync('public' + src), `Missing image: ${src}`)
})

test('custom size uses an illustrative house without claiming standard dimensions', () => {
  const input = { ...defaultConstructorInput, size: 'custom' as const }
  assert.equal(houseDimensions(input), null)
  assert.equal(photoScene(input), photoScene(defaultConstructorInput))
  assert.deepEqual(houseDimensions({ ...defaultConstructorInput, size: '6x10' }), { width: 6, depth: 10 })
})

test('insulation has three distinct available cutaways and does not reset exterior selections', () => {
  const selected = { ...defaultConstructorInput, roof: 'shingles' as const, facade: 'painted' as const, foundation: 'concrete' as const }
  const cutaways = cfg.insulation.map(item => insulationPhoto(item.id))
  assert.equal(new Set(cutaways).size, 3)
  for (const src of cutaways) assert.ok(existsSync('public' + src), src)
  for (const item of cfg.insulation) assert.deepEqual(photoLayers({ ...selected, insulation: item.id }), photoLayers(selected))
})
