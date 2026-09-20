import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as THREE from 'three'
import { buildHouse, type createHouseAssets } from '../src/components/constructor/house-geometry'
import { defaultConstructorInput } from '../src/lib/constructor/engine'
import { HouseAssembly } from '../src/components/constructor/house-assembly'

test('both roof slopes cover the full plan with upward normals; gables are closed at every size', () => {
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document')
  Object.defineProperty(globalThis, 'document', { configurable: true, value: {
    createElement: () => ({ width: 0, height: 0, getContext: () => ({ fillText() {}, fillRect() {}, clearRect() {} }) }),
  } })
  const material = new THREE.MeshStandardMaterial()
  const measure = new THREE.LineBasicMaterial()
  const assets = { materials: new Proxy({}, { get: (_target, key) => key === 'measure' ? measure : material }) } as ReturnType<typeof createHouseAssets>
  try {
    for (const size of ['6x6', '8x10'] as const) for (const roof of ['ondulin', 'metal', 'shingles'] as const) {
      const model = buildHouse({ ...defaultConstructorInput, size, roof }, assets)
      assert.ok(model.ghost.children.length > 0)
      model.ghost.traverse((node) => assert.ok(!(node instanceof THREE.LineSegments), 'size preview uses finished surfaces'))
      assert.equal(model.dimensions.children.filter((node) => node instanceof THREE.Sprite).length, 2, 'both measurements face the viewer')
      const assembly = new HouseAssembly(model.parts)
      assembly.finish(5)
      let projectedArea = 0
      const slopes = new Set<string>()
      model.root.traverse((node) => {
        if (!(node instanceof THREE.Mesh) || !/^roof-(-1|1)-\d+:3-/.test(node.name)) return
        slopes.add(node.name.split(':')[0].startsWith('roof--1') ? 'left' : 'right')
        const positions = node.geometry.getAttribute('position')
        const normals = node.geometry.getAttribute('normal')
        for (let i = 0; i < normals.count; i++) assert.ok(normals.getY(i) > 0, `${size}/${roof}: roof normal must face up`)
        for (let i = 0; i < positions.count; i += 3) {
          const ax = positions.getX(i + 1) - positions.getX(i)
          const az = positions.getZ(i + 1) - positions.getZ(i)
          const bx = positions.getX(i + 2) - positions.getX(i)
          const bz = positions.getZ(i + 2) - positions.getZ(i)
          projectedArea += Math.abs(ax * bz - az * bx) / 2
        }
      })
      assert.equal(slopes.size, 2)
      const ridge = model.parts.find((part) => part.id === 'ridge-cover:3')!
      const ridgeMesh = ridge.node.children[0] as THREE.Mesh
      ridgeMesh.geometry.computeBoundingBox()
      const ridgeBounds = ridgeMesh.geometry.boundingBox!
      assert.ok(ridgeBounds.min.x < -.11 && ridgeBounds.max.x > .11, 'Ridge cap must cover both slopes')
      assert.ok(Math.abs(ridgeBounds.min.x + ridgeBounds.max.x) < .001, 'Ridge cap must be symmetric')
      for (let stage = 0; stage <= 5; stage++) {
        assembly.finish(stage)
        model.parts.forEach((part) => assert.equal(part.node.visible, part.stage <= stage, `Only completed construction stages should be visible at step ${stage}`))
      }
      assert.ok(Math.abs(projectedArea - (model.width + .68) * (model.depth + .6)) < .002, `${size}/${roof}: roof must have no missing sheets`)
      for (const end of ['front', 'rear']) {
        const gable = model.parts.find((part) => part.id === `gable-${end}:4`)!
        const backing = gable.node.children.find((node) => node.name.endsWith('-woodDark')) as THREE.Mesh
        assert.ok(backing, 'Continuous gable sheathing must exist')
        backing.geometry.computeBoundingBox()
        const bounds = backing.geometry.boundingBox!
        assert.ok(bounds.max.y - bounds.min.y > 1.6)
        assert.ok(bounds.max.x - bounds.min.x > model.width)
      }
      model.dimensions.children.filter((node) => node instanceof THREE.Mesh).forEach((node) => {
        const up = new THREE.Vector3(0, 0, 1).applyQuaternion(node.quaternion)
        assert.ok(up.y > .99, 'Dimension text must lie on the ground')
      })
      model.dispose()
    }
  } finally {
    material.dispose()
    measure.dispose()
    if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument)
    else Reflect.deleteProperty(globalThis, 'document')
  }
})
