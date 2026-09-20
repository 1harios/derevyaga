import { constructorConfig, type SizeId } from '@/lib/constructor/config'
import type { ConstructorInput } from '@/lib/constructor/engine'
import type { StepId } from './visuals'

export type Point2 = readonly [number, number]
export type Opening = { center: number; width: number; bottom: number; height: number; door?: boolean }
export type HouseStage = 'plot' | 'foundation' | 'frame' | 'roof' | 'facade' | 'terrace'

/** Metres. These are presentation dimensions, not a structural or foundation design. */
export const HOUSE_DETAILS = {
  pileTop: 0.48,
  floorTop: 0.68,
  wallHeight: 2.4,
  ridgeRise: 1.5,
  eaves: 0.28,
  terraceDepth: 1.5,
  studSpacing: 0.6,
} as const

export const STAGE_ORDER: readonly HouseStage[] = ['plot', 'foundation', 'frame', 'roof', 'facade', 'terrace']

export function stageForStep(step: StepId): number {
  return { size: 0, foundation: 1, insulation: 2, roof: 3, facade: 4, terrace: 5, delivery: 5 }[step]
}

export function houseDimensions(size: SizeId) {
  const standard = size === 'custom' ? '6x6' : size
  const [width, depth] = standard.split('x').map(Number)
  const option = constructorConfig.sizes.find((item) => item.id === standard)!
  return { width, depth, pileCount: option.piles, illustrative: size === 'custom' }
}

/** Symmetric visual pile fields with the exact quantities used in the estimate. */
export function pilePositions(size: SizeId): Point2[] {
  const { width, depth } = houseDimensions(size)
  const columns = width === 6 ? 4 : 5
  const rows = width === 6 ? depth / 2 + 1 : depth === 8 ? 5 : 6
  const points: Point2[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      if (width === 8 && depth === 8 && row === 2 && col === 2) continue
      if (width === 8 && depth === 10 && (row === 2 || row === 3) && (col === 1 || col === 3)) continue
      points.push([-width / 2 + col * width / (columns - 1), -depth / 2 + row * depth / (rows - 1)])
    }
  }
  return points
}

/** Four windows from the base specification, plus one entrance door; positions are illustrative. */
export function wallOpenings(width: number, depth: number): Record<'front' | 'back' | 'left' | 'right', Opening[]> {
  return {
    front: [
      { center: -width * 0.23, width: 1, bottom: 0.95, height: 0.8 },
      { center: width * 0.2, width: 0.96, bottom: 0, height: 2, door: true },
    ],
    back: [],
    left: [{ center: -depth * 0.24, width: 0.5, bottom: 1.35, height: 0.5 }],
    right: [
      { center: -depth * 0.25, width: 1, bottom: 0.95, height: 0.8 },
      { center: depth * 0.25, width: 1, bottom: 0.95, height: 0.8 },
    ],
  }
}

/** Remove openings from a horizontal board course without covering a door or window. */
export function boardSpans(length: number, y: number, openings: readonly Opening[]): Point2[] {
  let spans: Point2[] = [[-length / 2, length / 2]]
  for (const hole of openings) {
    if (y < hole.bottom || y > hole.bottom + hole.height) continue
    const lo = hole.center - hole.width / 2
    const hi = hole.center + hole.width / 2
    spans = spans.flatMap(([a, b]): Point2[] => {
      if (hi <= a || lo >= b) return [[a, b]]
      const result: Point2[] = []
      if (lo > a) result.push([a, lo])
      if (hi < b) result.push([hi, b])
      return result
    })
  }
  return spans
}

/** Delivery affects the estimate only, and must not rebuild the 3D geometry. */
export function modelKey(input: ConstructorInput): string {
  return [input.size, input.foundation, input.insulation, input.roof, input.facade, input.terrace].join(':')
}
