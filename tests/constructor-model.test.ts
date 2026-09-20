import assert from 'node:assert/strict'
import { test } from 'node:test'
import { constructorConfig } from '../src/lib/constructor/config'
import { defaultConstructorInput, estimateHouse } from '../src/lib/constructor/engine'
import { boardSpans, houseDimensions, modelKey, pilePositions, stageForStep, wallOpenings } from '../src/components/constructor/house-model'
import { STEPS, visualFor } from '../src/components/constructor/visuals'

test('every quoted size has the correct area and a symmetric pile field with the exact priced quantity', () => {
  for (const size of constructorConfig.sizes.filter((s) => s.id !== 'custom')) {
    const { width, depth } = houseDimensions(size.id)
    assert.equal(width * depth, size.area, size.id)
    const piles = pilePositions(size.id)
    assert.equal(piles.length, size.piles, size.id)
    assert.equal(new Set(piles.map((p) => p.join(':'))).size, size.piles)
    for (const [x, z] of piles) {
      assert.ok(Math.abs(x) <= width / 2 && Math.abs(z) <= depth / 2)
      assert.ok(piles.some(([otherX, otherZ]) => Math.abs(otherX + x) < 1e-8 && Math.abs(otherZ + z) < 1e-8))
    }
  }
})

test('the requested construction sequence is cumulative and delivery adds no new geometry', () => {
  assert.deepEqual(STEPS.map((s) => stageForStep(s.id)), [0, 1, 2, 3, 4, 5, 5])
  const selected = { ...defaultConstructorInput, roof: 'metal' as const, facade: 'painted' as const }
  assert.equal(modelKey(selected), modelKey({ ...selected, distanceKm: 250 }))
  for (const patch of [{ terrace: false }, { roof: 'shingles' as const }, { foundation: 'concrete' as const }, { insulation: '200' as const }, { facade: 'planken' as const }, { size: '8x10' as const }]) {
    assert.notEqual(modelKey(selected), modelKey({ ...selected, ...patch }))
  }
})

test('window and door openings match the base specification for all five sizes', () => {
  for (const size of constructorConfig.sizes.filter((s) => s.id !== 'custom')) {
    const { width, depth } = houseDimensions(size.id)
    const walls = wallOpenings(width, depth - 1.5)
    const holes = Object.values(walls).flat()
    assert.equal(holes.filter((h) => h.door).length, 1)
    assert.equal(holes.filter((h) => h.width === 1 && h.height === 0.8).length, 3)
    assert.equal(holes.filter((h) => h.width === 0.5 && h.height === 0.5).length, 1)
    for (const [wall, openings] of Object.entries(walls)) {
      const length = wall === 'front' || wall === 'back' ? width : depth - 1.5
      for (const h of openings) {
        assert.ok(h.center - h.width / 2 >= -length / 2)
        assert.ok(h.center + h.width / 2 <= length / 2)
      }
    }
  }
})

test('cladding courses leave the entrance and window apertures open', () => {
  const holes = [{ center: -1.4, width: 1, bottom: 0.95, height: 0.8 }, { center: 1.2, width: 0.96, bottom: 0, height: 2, door: true }]
  for (const y of [0, 0.5, 0.95, 1.2, 1.75, 2, 2.3]) {
    const spans = boardSpans(6, y, holes)
    assert.ok(spans.every(([a, b]) => a < b && a >= -3 && b <= 3))
    for (const h of holes.filter((h) => y >= h.bottom && y <= h.bottom + h.height)) {
      assert.ok(spans.every(([a, b]) => b <= h.center - h.width / 2 || a >= h.center + h.width / 2))
    }
  }
})

test('custom size is clearly marked as an illustrative example and never receives a standard-house price', () => {
  const input = { ...defaultConstructorInput, size: 'custom' as const }
  assert.equal(houseDimensions('custom').illustrative, true)
  assert.equal(estimateHouse(input).custom, true)
  assert.equal(estimateHouse(input).total, 0)
  assert.match(visualFor('size', input).caption, /пример.*6×6/)
  assert.match(visualFor('foundation', input).caption, /по проекту/)
})

test('visual changes keep the original estimate intact across all 540 standard configurations', () => {
  let count = 0
  for (const size of constructorConfig.sizes.filter((s) => s.id !== 'custom')) {
    for (const foundation of constructorConfig.foundations) for (const insulation of constructorConfig.insulation) {
      for (const roof of constructorConfig.roofs) for (const facade of constructorConfig.facades) for (const terrace of [false, true]) {
        const input = { size: size.id, foundation: foundation.id, insulation: insulation.id, roof: roof.id, facade: facade.id, terrace, distanceKm: 100 }
        const estimate = estimateHouse(input)
        assert.equal(estimate.piles.count, pilePositions(size.id).length)
        assert.equal(estimate.total, estimate.house + estimate.piles.price + estimate.delivery)
        assert.ok(Number.isFinite(estimate.total) && estimate.total > 0)
        count++
      }
    }
  }
  assert.equal(count, 540)
  assert.equal(estimateHouse({ size: '8x10', foundation: 'screw', insulation: '200', roof: 'metal', facade: 'painted', terrace: true, distanceKm: 100 }).total, 1_775_000)
})
