import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { ConstructorInput } from '@/lib/constructor/engine'
import { constructorConfig } from '@/lib/constructor/config'
import { createHouseAssets } from './house-materials'

export { createHouseAssets } from './house-materials'

type Assets = ReturnType<typeof createHouseAssets>
type MaterialName = Exclude<keyof Assets['materials'], 'measure'>
type PartSpec = {
  id: string
  stage: number
  node: THREE.Group
  rest: THREE.Vector3
  offset: THREE.Vector3
  delay: number
  duration: number
  axis: THREE.Vector3
  angle: number
}
type GeometryBatch = { stage: number; material: MaterialName; partId: string; geometries: THREE.BufferGeometry[] }

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

/**
 * Port of the procedural model supplied in derevyaga-calculator.html.
 * Every wall, truss, roof sheet and terrace element is a rigid animated assembly part.
 */
export function buildHouse(input: ConstructorInput, assets: Assets) {
  const size = constructorConfig.sizes.find((item) => item.id === input.size) ?? constructorConfig.sizes[0]
  const [width, overallDepth] = (size.id === 'custom' ? '6x6' : size.id).split('x').map(Number)
  const floorY = .68
  const wallHeight = 2.55
  const wallTop = floorY + wallHeight
  const ridgeRise = 1.65
  const ridgeY = wallTop + ridgeRise
  const terraceDepth = input.terrace ? 1.45 : 0
  const depth = overallDepth - terraceDepth
  const root = new THREE.Group()
  root.name = 'parametric-house'
  const stages = Array.from({ length: 6 }, (_, index) => {
    const group = new THREE.Group()
    group.name = `construction-stage-${index}`
    root.add(group)
    return group
  })
  const dimensions = new THREE.Group()
  const ghost = new THREE.Group()
  root.add(dimensions, ghost)

  const batches = new Map<string, GeometryBatch>()
  const definitions = new Map<string, Omit<PartSpec, 'node'>>()
  const parts: PartSpec[] = []
  let activePart = 'base'
  let wallIndex = 0
  const matrix = new THREE.Matrix4()
  const quaternion = new THREE.Quaternion()

  function definePart(
    id: string,
    stage: number,
    rest = new THREE.Vector3(),
    offset = new THREE.Vector3(0, .45, 0),
    delay = 0,
    duration = 700,
    axis = new THREE.Vector3(0, 1, 0),
    angle = 0,
  ) {
    definitions.set(`${id}:${stage}`, { id, stage, rest, offset, delay, duration, axis, angle })
    activePart = id
  }

  function addGeometry(
    geometry: THREE.BufferGeometry,
    material: MaterialName,
    stage: number,
    position: THREE.Vector3,
    rotation = new THREE.Euler(),
  ) {
    quaternion.setFromEuler(rotation)
    matrix.compose(position, quaternion, V(1, 1, 1))
    geometry.applyMatrix4(matrix)
    const partId = `${activePart}:${stage}`
    const batchId = `${partId}-${material}`
    if (!definitions.has(partId)) {
      definitions.set(partId, {
        id: activePart, stage, rest: new THREE.Vector3(), offset: V(0, .35, 0),
        delay: 0, duration: 650, axis: V(0, 1, 0), angle: 0,
      })
    }
    if (!batches.has(batchId)) batches.set(batchId, { stage, material, partId, geometries: [] })
    const ready = geometry.index ? geometry.toNonIndexed() : geometry
    batches.get(batchId)!.geometries.push(ready)
    if (ready !== geometry) geometry.dispose()
  }

  function box(
    w: number, h: number, d: number, x: number, y: number, z: number,
    material: MaterialName, stage: number, rotateY = 0,
  ) {
    if (w < .001 || h < .001 || d < .001) return
    const radius = Math.min(.008, Math.min(w, h, d) * .17)
    const geometry = stage >= 3
      ? new RoundedBoxGeometry(w, h, d, 1, radius)
      : new THREE.BoxGeometry(w, h, d)
    const uv = geometry.getAttribute('uv') as THREE.BufferAttribute
    const positions = geometry.getAttribute('position') as THREE.BufferAttribute
    const normals = geometry.getAttribute('normal') as THREE.BufferAttribute
    const longest = w >= h && w >= d ? 0 : h >= d ? 1 : 2
    const offsetU = ((x * .171 + y * 2.31 + z * .147) % 1 + 1) % 1
    const offsetV = ((y * 1.77 + z * .381) % 1 + 1) % 1
    for (let i = 0; i < uv.count; i++) {
      const p = [positions.getX(i), positions.getY(i), positions.getZ(i)]
      const n = [Math.abs(normals.getX(i)), Math.abs(normals.getY(i)), Math.abs(normals.getZ(i))]
      const face = n.indexOf(Math.max(...n))
      const other = [0, 1, 2].find((axis) => axis !== longest && axis !== face) ?? (longest + 1) % 3
      uv.setXY(i, p[longest] / 1.6 + offsetU, p[other] / .7 + offsetV)
    }
    addGeometry(geometry, material, stage, V(x, y, z), new THREE.Euler(0, rotateY, 0))
  }

  function beam(
    start: THREE.Vector3, end: THREE.Vector3, widthValue: number, thickness: number,
    material: MaterialName, stage: number,
  ) {
    const length = start.distanceTo(end)
    const center = start.clone().add(end).multiplyScalar(.5)
    const geometry = new THREE.BoxGeometry(length, thickness, widthValue)
    const uv = geometry.getAttribute('uv') as THREE.BufferAttribute
    for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * length / 1.8)
    const rotation = new THREE.Quaternion().setFromUnitVectors(V(1, 0, 0), end.clone().sub(start).normalize())
    const euler = new THREE.Euler().setFromQuaternion(rotation)
    addGeometry(geometry, material, stage, center, euler)
  }

  const pileCount = size.id === 'custom' ? 16 : size.piles
  const pileColumns = pileCount === 26 ? 5 : 4
  const pileRows = pileCount === 26 ? 5 : pileCount / 4
  const pilePositions: Array<[number, number]> = []
  for (let row = 0; row < pileRows; row++) for (let column = 0; column < pileColumns; column++) {
    pilePositions.push([
      -(width / 2 - .18) + (width - .36) * column / (pileColumns - 1),
      -depth / 2 + .2 + (depth + terraceDepth - .4) * row / (pileRows - 1),
    ])
  }
  if (pileCount === 26) pilePositions.push([0, -depth / 2 + .2 + (depth + terraceDepth - .4) / 8])
  root.userData.pilePositions = pilePositions
  root.userData.insulationMm = Number(input.insulation)

  pilePositions.forEach(([x, z], index) => {
    definePart(`pile-${index}`, 1, V(x, .3, z), V(0, .65, 0), index * 28, 630, V(0, 1, 0), input.foundation === 'screw' ? -Math.PI * 3 : 0)
    if (input.foundation === 'screw') {
      addGeometry(new THREE.CylinderGeometry(.058, .058, .52, 14), 'steel', 1, V(x, .28, z))
      addGeometry(new THREE.CylinderGeometry(.135, .135, .018, 20), 'steel', 1, V(x, .06, z))
    } else box(.18, .54, .18, x, .28, z, 'concrete', 1)
    box(.23, .03, .23, x, .55, z, 'steel', 1)
  })

  definePart('floor', 2, V(0, floorY, 0), V(0, .5, 0), 0, 620)
  for (const x of [-width / 2 + .08, width / 2 - .08]) box(.15, .19, depth + terraceDepth, x, .57, terraceDepth / 2, 'frame', 2)
  for (const z of [-depth / 2 + .08, depth / 2 - .08, ...(terraceDepth ? [depth / 2 + terraceDepth - .08] : [])]) box(width, .19, .15, 0, .57, z, 'frame', 2)
  for (let z = -depth / 2 + .3; z < depth / 2; z += .55) box(width - .2, .15, .05, 0, .57, z, 'frame', 2)
  for (let x = -width / 2 + .1; x < width / 2; x += .155) box(.148, .035, depth - .13, x, floorY, 0, x % .31 > .15 ? 'wood' : 'woodLight', 2)

  const facadeMaterial: MaterialName = input.facade === 'painted' ? 'moss' : input.facade === 'planken' ? 'planken' : 'wood'
  type Opening = { x: number; width: number; bottom: number; height: number; door?: boolean }
  function wall(length: number, x: number, z: number, rotationY: number, openings: Opening[]) {
    const index = wallIndex++
    const id = `wall-${index}`
    const delay = 640 + index * 140
    const rotation = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), rotationY)
    const outward = V(0, 0, 1).applyQuaternion(rotation)
    const hinge = V(1, 0, 0).applyQuaternion(rotation)
    definePart(id, 2, V(x, floorY, z), V(0, .08, 0), delay, 700, hinge, Math.PI * .26)
    definePart(id, 4, V(x, floorY, z), outward.clone().multiplyScalar(.22), index * 170, 620)
    activePart = id
    const point = (u: number, y: number, out = 0) => V(u, floorY + y, out).applyQuaternion(rotation).add(V(x, 0, z))
    const add = (w: number, h: number, d: number, u: number, y: number, out: number, material: MaterialName, stage: number) => {
      const p = point(u, y, out)
      box(w, h, d, p.x, p.y, p.z, material, stage, rotationY)
    }
    const spans = (y: number) => {
      let values: Array<[number, number]> = [[-length / 2, length / 2]]
      for (const opening of openings) if (y > opening.bottom && y < opening.bottom + opening.height) {
        const left = opening.x - opening.width / 2 - .025
        const right = opening.x + opening.width / 2 + .025
        values = values.flatMap(([a, b]): Array<[number, number]> => right <= a || left >= b
          ? [[a, b]]
          : [...(left > a ? [[a, left] as [number, number]] : []), ...(right < b ? [[right, b] as [number, number]] : [])])
      }
      return values
    }
    add(length, .1, .145, 0, .05, 0, 'frame', 2)
    add(length, .08, .145, 0, wallHeight - .04, 0, 'frame', 2)
    add(length, .08, .145, 0, wallHeight - .12, 0, 'frame', 2)
    const studs = new Set([-length / 2 + .025, length / 2 - .025])
    for (let u = -length / 2 + .06; u < length / 2; u += .59) studs.add(u)
    openings.forEach((opening) => { studs.add(opening.x - opening.width / 2 - .05); studs.add(opening.x + opening.width / 2 + .05) })
    for (const u of studs) {
      const opening = openings.find((item) => u > item.x - item.width / 2 && u < item.x + item.width / 2)
      const sections: Array<[number, number]> = opening
        ? [[.1, opening.bottom], [opening.bottom + opening.height, wallHeight - .16]]
        : [[.1, wallHeight - .16]]
      for (const [bottom, top] of sections) if (top > bottom) add(.047, top - bottom, .145, u, (top + bottom) / 2, 0, 'frame', 2)
    }
    openings.forEach((opening) => {
      add(opening.width + .17, .145, .145, opening.x, opening.bottom + opening.height + .075, 0, 'frame', 2)
      if (!opening.door) add(opening.width + .12, .06, .145, opening.x, opening.bottom - .025, 0, 'frame', 2)
    })
    const insulation = Number(input.insulation) / 1000
    definePart(`${id}-insulation`, 2, V(x, floorY, z), outward.clone().multiplyScalar(.26), delay + 710, 450)
    for (let y = .17; y < wallHeight - .15; y += .18) for (const [a, b] of spans(y)) {
      for (let u = a + .035; u < b - .035; u += .59) {
        const panelWidth = Math.min(.49, b - u - .035)
        if (panelWidth > .035) add(panelWidth, .172, insulation, u + panelWidth / 2, y, -.055, 'insulation', 2)
      }
    }
    activePart = id
    const course = input.facade === 'planken' ? .115 : .155
    const gap = input.facade === 'planken' ? .01 : .003
    for (let bottom = 0; bottom < wallHeight; bottom += course) {
      const top = Math.min(wallHeight, bottom + course - gap)
      const cuts = [bottom, top, ...openings.flatMap((opening) => [opening.bottom, opening.bottom + opening.height]).filter((cut) => cut > bottom && cut < top)].sort((a, b) => a - b)
      for (let cut = 0; cut < cuts.length - 1; cut++) {
        const y = (cuts[cut] + cuts[cut + 1]) / 2
        for (const [a, b] of spans(y)) {
          const material = input.facade === 'timber' && Math.floor(bottom / course) % 5 === 1 ? 'woodLight' : facadeMaterial
          add(b - a, cuts[cut + 1] - cuts[cut], .033, (a + b) / 2, y, .091, material, 4)
        }
      }
    }
    for (const u of [-length / 2, length / 2]) add(.11, wallHeight + .025, .055, u, wallHeight / 2, .125, input.facade === 'painted' ? 'woodLight' : facadeMaterial, 4)
    add(length + .09, .1, .12, 0, .015, .085, facadeMaterial, 4)
    openings.forEach((opening) => {
      const bottom = opening.bottom
      const top = bottom + opening.height
      if (opening.door) {
        add(opening.width - .05, opening.height, .065, opening.x, bottom + opening.height / 2, .045, 'dark', 4)
        add(opening.width - .17, opening.height - .25, .018, opening.x, bottom + opening.height / 2, .085, 'steel', 4)
        add(.045, .025, .08, opening.x + opening.width * .32, bottom + 1.02, .13, 'zinc', 4)
        add(.13, .022, .027, opening.x + opening.width * .29, bottom + 1.02, .17, 'zinc', 4)
      } else {
        const mid = bottom + opening.height / 2
        // Recessed interior, deep reveals, rubber seals and individual glazed sashes.
        add(opening.width, opening.height, .02, opening.x, mid, -.19, 'interior', 4)
        for (const u of [opening.x - opening.width / 2 + .03, opening.x + opening.width / 2 - .03]) {
          add(.065, opening.height, .25, u, mid, -.025, 'white', 4)
        }
        const count = opening.width > .8 ? 2 : 1
        const sash = (opening.width - .09) / count
        for (let pane = 0; pane < count; pane++) {
          const u = opening.x - opening.width / 2 + .045 + sash * (pane + .5)
          add(sash - .015, opening.height - .07, .035, u, mid, .039, 'gasket', 4)
          add(sash - .085, opening.height - .15, .016, u, mid, .061, 'glass', 4)
          for (const edge of [-1, 1]) {
            add(.033, opening.height - .08, .062, u + edge * (sash / 2 - .024), mid, .076, 'white', 4)
            add(sash - .035, .034, .062, u, mid + edge * (opening.height / 2 - .054), .076, 'white', 4)
          }
          // A few linen folds behind the glass give the room depth without a flat decal.
          for (let fold = 0; fold < 4; fold++) {
            add(.026, opening.height - .18, .025, u - sash * .31 + fold * .025, mid, -.12 - (fold % 2) * .012, 'curtain', 4)
          }
        }
        add(.024, .11, .033, opening.x + .064, mid - .06, .131, 'zinc', 4)
        add(.025, .025, .05, opening.x + .064, mid - .015, .11, 'zinc', 4)
        add(opening.width + .2, .036, .26, opening.x, bottom - .043, .115, 'white', 4)
        add(opening.width + .2, .045, .025, opening.x, bottom - .066, .236, 'zinc', 4)
      }
      const trim: MaterialName = opening.door ? 'woodLight' : 'white'
      for (const u of [opening.x - opening.width / 2, opening.x + opening.width / 2]) add(.075, opening.height + .12, .115, u, bottom + opening.height / 2, .074, trim, 4)
      for (const y of [bottom, top]) add(opening.width + .09, .075, .115, opening.x, y, .074, trim, 4)
      add(opening.width + .25, .13, .04, opening.x, top + .06, .126, facadeMaterial === 'moss' ? 'woodLight' : facadeMaterial, 4)
    })
  }

  wall(width, 0, depth / 2, 0, [
    { x: 0, width: .94, bottom: .04, height: 2.08, door: true },
    { x: -width * .3, width: 1.16, bottom: .98, height: 1.19 },
    { x: width * .3, width: 1.16, bottom: .98, height: 1.19 },
  ])
  wall(depth, width / 2, 0, Math.PI / 2, [
    { x: -depth * .2, width: 1.25, bottom: .98, height: 1.19 },
    { x: depth * .27, width: .59, bottom: 1.61, height: .55 },
  ])
  wall(width, 0, -depth / 2, Math.PI, [{ x: width * .24, width: 1.16, bottom: .98, height: 1.19 }])
  wall(depth, -width / 2, 0, -Math.PI / 2, [{ x: 0, width: 1.34, bottom: .98, height: 1.19 }])

  const roofFront = depth / 2 + terraceDepth + .3
  const roofBack = -depth / 2 - .3
  const roofHalf = width / 2 + .34
  const roofSlope = ridgeRise / roofHalf
  definePart('ridge-structure', 2, V(0, wallTop, 0), V(0, .7, 0), 2070, 550)
  let truss = 0
  for (let z = roofBack + .1; z <= roofFront; z += .57) {
    definePart(`truss-${truss}`, 2, V(0, wallTop, z), V(0, .75, 0), 2140 + truss * 35, 570)
    truss++
    beam(V(-roofHalf, wallTop, z), V(0, ridgeY, z), .16, .045, 'frame', 2)
    beam(V(0, ridgeY, z), V(roofHalf, wallTop, z), .16, .045, 'frame', 2)
    beam(V(-width / 2, wallTop, z), V(width / 2, wallTop, z), .075, .045, 'frame', 2)
  }
  activePart = 'ridge-structure'
  box(.1, .2, roofFront - roofBack, 0, ridgeY - .11, (roofFront + roofBack) / 2, 'frame', 2)
  for (const x of [-roofHalf + .08, roofHalf - .08]) box(.12, .15, roofFront - roofBack, x, wallTop, (roofFront + roofBack) / 2, 'frame', 2)

  function roofSide(side: -1 | 1) {
    const along = input.roof === 'metal' ? 92 : 44
    const across = input.roof === 'ondulin' ? Math.ceil((roofFront - roofBack) / .095) * 4 : input.roof === 'metal' ? Math.ceil((roofFront - roofBack) / .26) * 6 : 36
    const positions: number[] = [], uvs: number[] = [], indices: number[] = []
    for (let zIndex = 0; zIndex <= across; zIndex++) for (let xIndex = 0; xIndex <= along; xIndex++) {
      const run = roofHalf * xIndex / along
      const z = roofBack + (roofFront - roofBack) * zIndex / across
      const relief = input.roof === 'ondulin'
        ? Math.sin((z - roofBack) / .095 * Math.PI * 2) * .01
        : input.roof === 'metal'
          ? Math.pow(Math.max(0, Math.cos((z - roofBack) / .26 * Math.PI * 2)), 8) * .023 + Math.floor(run / .35) % 2 * .006
          : .002
      positions.push(side * run, ridgeY - run * roofSlope + .11 + relief, z)
      uvs.push(run * .65, (z - roofBack) * .65)
      if (xIndex < along && zIndex < across) {
        const a = zIndex * (along + 1) + xIndex
        const b = a + along + 1
        // Each slope needs outward winding; the mirrored slope otherwise vanishes
        // from the depth/normal pass even when its colour material is double-sided.
        if (side === 1) indices.push(a, b, a + 1, b, b + 1, a + 1)
        else indices.push(a, a + 1, b, b, a + 1, b + 1)
      }
    }
    const full = new THREE.BufferGeometry()
    full.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    full.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    full.setIndex(indices)
    full.computeVertexNormals()
    const sheets = Math.ceil((roofFront - roofBack) / .95)
    for (let index = 0; index < sheets; index++) {
      const first = Math.floor(index * across / sheets)
      const last = Math.floor((index + 1) * across / sheets)
      const z = roofBack + (roofFront - roofBack) * (first + last) / (2 * across)
      definePart(`roof-${side}-${index}`, 3, V(side * roofHalf / 2, ridgeY - ridgeRise / 2, z), V(side * .12, .7, 0), index * 70 + (side === 1 ? 35 : 0), 620)
      const sheet = new THREE.BufferGeometry()
      sheet.setAttribute('position', full.getAttribute('position'))
      sheet.setAttribute('normal', full.getAttribute('normal'))
      sheet.setAttribute('uv', full.getAttribute('uv'))
      sheet.setIndex(indices.slice(first * along * 6, last * along * 6))
      addGeometry(sheet, input.roof, 3, V(0, 0, 0))
    }
    full.dispose()
    definePart(`roof-edge-${side}`, 3, V(side * roofHalf, wallTop, (roofFront + roofBack) / 2), V(side * .1, .4, 0), 1350, 500)
    if (input.roof === 'shingles') for (let run = .05; run < roofHalf; run += .2) {
      const y = ridgeY - run * roofSlope + .119
      beam(V(side * run, y, roofBack), V(side * run, y, roofFront), .015, .02, 'shingles', 3)
    }
    for (const z of [roofBack, roofFront]) beam(V(0, ridgeY + .052, z), V(side * roofHalf, wallTop + .052, z), .14, .07, 'woodLight', 3)
    box(.075, .16, roofFront - roofBack + .08, side * roofHalf, wallTop + .008, (roofFront + roofBack) / 2, 'woodLight', 3)
  }
  roofSide(-1)
  roofSide(1)
  definePart('ridge-cover', 3, V(0, ridgeY, (roofFront + roofBack) / 2), V(0, .45, 0), 1500, 420)
  // The cap straddles the ridge. A 0..PI cylinder covered only its right half.
  addGeometry(new THREE.CylinderGeometry(.12, .12, roofFront - roofBack + .13, 16, 1, false, -Math.PI / 2, Math.PI), input.roof, 3, V(0, ridgeY + .095, (roofFront + roofBack) / 2), new THREE.Euler(-Math.PI / 2, 0, 0))

  for (const z of [roofFront - .045, roofBack + .025]) {
    definePart(`gable-${z > 0 ? 'front' : 'rear'}`, 4, V(0, wallTop, z), V(0, .18, z > 0 ? .24 : -.24), z > 0 ? 690 : 850, 520)
    // Continuous sheathing closes the entire triangle behind the board joints.
    const backing = new THREE.Shape()
    backing.moveTo(-roofHalf + .02, 0)
    backing.lineTo(roofHalf - .02, 0)
    backing.lineTo(0, ridgeRise - .01)
    backing.closePath()
    addGeometry(new THREE.ExtrudeGeometry(backing, { depth: .045, bevelEnabled: false }), 'woodDark', 4, V(0, wallTop, z > 0 ? z - .047 : z + .036))
    for (let bottom = 0; bottom < ridgeRise; bottom += .145) {
      const top = Math.min(ridgeRise, bottom + .142)
      const bottomHalf = Math.max(0, roofHalf - bottom / roofSlope - .015)
      const topHalf = Math.max(0, roofHalf - top / roofSlope - .015)
      if (bottomHalf < .008) continue
      const shape = new THREE.Shape()
      shape.moveTo(-bottomHalf, 0); shape.lineTo(bottomHalf, 0); shape.lineTo(topHalf, top - bottom); shape.lineTo(-topHalf, top - bottom); shape.closePath()
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: .034, bevelEnabled: false, curveSegments: 1 })
      const positions = geometry.getAttribute('position') as THREE.BufferAttribute
      const uv = geometry.getAttribute('uv') as THREE.BufferAttribute
      for (let i = 0; i < positions.count; i++) uv.setXY(i, positions.getX(i) / 1.6 + bottom * .27, positions.getY(i) / .7 + bottom * 1.37)
      addGeometry(geometry, facadeMaterial, 4, V(0, wallTop + bottom + .025, z))
    }
  }

  for (const side of [-1, 1]) {
    definePart(`roof-underlay-${side}`, 3, V(side * roofHalf / 2, wallTop, 0), V(0, .28, 0), 0, 600)
    const points = [V(0, ridgeY - .045, roofBack), V(side * roofHalf, wallTop - .045, roofBack), V(side * roofHalf, wallTop - .045, roofFront), V(0, ridgeY - .045, roofFront)]
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    geometry.setIndex(side === 1 ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2])
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, roofHalf / 1.6, 0, roofHalf / 1.6, (roofFront - roofBack) / .7, 0, (roofFront - roofBack) / .7], 2))
    geometry.computeVertexNormals()
    addGeometry(geometry, 'woodDark', 3, V(0, 0, 0))
  }

  if (terraceDepth) {
    definePart('terrace-posts', 2, V(0, floorY, depth / 2 + terraceDepth), V(0, .28, 0), 1480, 560)
    for (const x of [-width / 2 + .1, width / 2 - .1, -width * .19, width * .19]) beam(V(x, floorY, depth / 2 + terraceDepth - .12), V(x, wallTop - .06, depth / 2 + terraceDepth - .12), .115, .115, 'frame', 2)
    definePart('terrace-deck', 5, V(0, floorY, depth / 2 + terraceDepth / 2), V(0, .32, 0), 0, 590)
    for (let x = -width / 2 + .09; x < width / 2; x += .145) box(.139, .035, terraceDepth, x, floorY, depth / 2 + terraceDepth / 2, 'woodLight', 5)
    const front = depth / 2 + terraceDepth - .09
    definePart('terrace-rails', 5, V(0, floorY, front), V(0, .3, .18), 620, 590)
    for (const side of [-1, 1]) {
      const inner = side * .73
      const outer = side * (width / 2 - .12)
      const center = (inner + outer) / 2
      const span = Math.abs(outer - inner)
      for (const y of [.22, .53, .83]) box(span, .085, .048, center, floorY + y, front, 'woodLight', 5)
      box(.09, .94, .09, inner, floorY + .47, front, 'woodLight', 5)
      box(span + .12, .055, .095, center, floorY + .94, front, 'woodLight', 5)
      for (const y of [.22, .53, .83]) box(.048, .085, terraceDepth, side * (width / 2 - .12), floorY + y, depth / 2 + terraceDepth / 2, 'woodLight', 5)
      box(.095, .055, terraceDepth + .06, side * (width / 2 - .12), floorY + .94, depth / 2 + terraceDepth / 2, 'woodLight', 5)
    }
  }
  for (let stair = 0; stair < 3; stair++) {
    const z = depth / 2 + terraceDepth + .15 + stair * .27
    const y = floorY - (stair + 1) * .18
    definePart(`stair-${stair}`, 5, V(0, y, z), V(0, .3, .12), 900 + stair * 80, 430)
    box(1.36, .045, .3, 0, y, z, 'woodLight', 5)
    for (const x of [-.5, .5]) box(.055, .15, .29, x, y - .085, z, 'frame', 5)
  }

  const nodes = new Map<string, THREE.Group>()
  for (const batch of batches.values()) {
    const geometry = mergeGeometries(batch.geometries, false)
    batch.geometries.forEach((item) => item.dispose())
    if (!geometry) continue
    const spec = definitions.get(batch.partId)!
    if (!nodes.has(batch.partId)) {
      const node = new THREE.Group()
      node.name = batch.partId
      node.position.copy(spec.rest)
      node.visible = false
      stages[batch.stage].add(node)
      nodes.set(batch.partId, node)
      parts.push({ ...spec, id: batch.partId, node })
    }
    geometry.translate(-spec.rest.x, -spec.rest.y, -spec.rest.z)
    const mesh = new THREE.Mesh(geometry, assets.materials[batch.material])
    mesh.castShadow = batch.material !== 'glass'
    mesh.receiveShadow = true
    mesh.name = `${batch.partId}-${batch.material}`
    nodes.get(batch.partId)!.add(mesh)
  }

  // A translucent finished exterior, with the same windows, roof and terrace as the assembled house.
  const previewMaterials: THREE.Material[] = []
  for (const part of parts.filter((part) => part.stage !== 2)) {
    const preview = part.node.clone(true)
    preview.position.copy(part.rest)
    preview.visible = true
    preview.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return
      node.name = 'preview-' + node.name
      node.geometry = node.geometry.clone()
      const material = (node.material as THREE.MeshStandardMaterial).clone()
      material.transparent = true
      material.opacity = node.name.includes('glass') ? .38 : .62
      material.depthWrite = true
      previewMaterials.push(material)
      node.material = material
      node.castShadow = false
    })
    ghost.add(preview)
  }

  const labelMaterials: THREE.SpriteMaterial[] = []
  function dimensionLabel(text: string, x: number, z: number, axis: 'x' | 'z') {
    const canvas = document.createElement('canvas')
    canvas.width = 512; canvas.height = 128
    const context = canvas.getContext('2d')!
    context.clearRect(0, 0, 512, 128)
    context.font = '500 82px Inter'; context.textAlign = 'center'; context.textBaseline = 'middle'; context.fillStyle = '#4e6254'; context.fillText(text, 256, 64)
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace
    const material = new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, depthTest: false, toneMapped: false })
    labelMaterials.push(material)
    const label = new THREE.Sprite(material)
    label.userData.dimensionAxis = axis
    label.scale.set(1.9, .475, 1)
    label.position.set(x, .065, z)
    dimensions.add(label)
  }
  const measureMaterial = assets.materials.measure
  for (const line of [[V(-width / 2, .05, depth / 2 + terraceDepth + 1.1), V(width / 2, .05, depth / 2 + terraceDepth + 1.1)], [V(width / 2 + .85, .05, -depth / 2), V(width / 2 + .85, .05, depth / 2 + terraceDepth)]] as const) {
    dimensions.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([...line]), measureMaterial))
    line.forEach((point) => dimensions.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([point.clone().add(V(-.08, 0, -.08)), point.clone().add(V(.08, 0, .08))]), measureMaterial)))
  }
  for (const x of [-width / 2, width / 2]) dimensions.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(x, .05, depth / 2), V(x, .05, depth / 2 + terraceDepth + 1.3)]), measureMaterial))
  for (const z of [-depth / 2, depth / 2 + terraceDepth]) dimensions.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(width / 2, .05, z), V(width / 2 + 1.05, .05, z)]), measureMaterial))
  dimensionLabel(`${width} м`, 0, depth / 2 + terraceDepth + 1.4, 'x')
  dimensionLabel(`${overallDepth} м`, width / 2 + 1.12, terraceDepth / 2, 'z')
  dimensions.traverse((node) => node.layers.set(1))
  root.position.z = -terraceDepth / 2

  return {
    root, stages, layers: stages, parts, dimensions, ghost,
    width, depth: depth + terraceDepth, dimensionCenterZ: terraceDepth / 2, pileCount: pilePositions.length,
    dispose() {
      root.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) object.geometry.dispose()
        if (object instanceof THREE.Sprite) { object.material.map?.dispose(); object.material.dispose() }
      })
      previewMaterials.forEach((material) => material.dispose())
      labelMaterials.forEach((material) => { material.map?.dispose(); material.dispose() })
      root.removeFromParent()
    },
  }
}

