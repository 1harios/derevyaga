import type { ConstructorInput } from '@/lib/constructor/engine'

export type SceneSize = Exclude<ConstructorInput['size'], 'custom'>
export const approvedPhotoRoot = '/constructor/approved-variants-v1'

/** Masks measured on approved 1536 × 1024 canvases. The foundation excludes the stairs. */
export const sceneGeometry: Record<SceneSize, { roof: string; foundation: string }> = {
  '6x6': {
    roof: '220,336 536,69 1055,204 1347,404 1316,389 885,309 537,99 240,356 223,359',
    foundation: '310,712 399,715 367,824 606,827 659,729 944,741 1287,710 1300,840 298,840',
  },
  '6x8': {
    roof: '196,336 503,69 1100,221 1390,425 1357,407 840,308 504,99 214,355 198,359',
    foundation: '287,713 373,715 345,823 555,825 617,729 878,742 1335,704 1340,840 280,840',
  },
  '6x10': {
    roof: '142,336 435,81 1145,261 1410,441 1378,426 749,310 435,111 161,353 144,355',
    foundation: '237,699 329,703 289,810 496,815 557,716 775,729 1369,682 1380,828 230,828',
  },
  '8x8': {
    roof: '108,344 505,58 1140,220 1425,421 1398,406 940,309 505,88 127,362 110,366',
    foundation: '196,709 372,715 318,825 590,837 657,728 980,736 1384,699 1395,848 185,848',
  },
  '8x10': {
    roof: '69,344 450,68 1175,267 1475,451 1445,439 862,312 450,98 88,364 71,364',
    foundation: '155,707 326,713 275,825 522,835 596,726 901,736 1421,686 1435,850 145,850',
  },
}

export function sceneSize(input: ConstructorInput): SceneSize {
  return input.size === 'custom' ? '6x6' : input.size
}

/** Architecture and facade are selected together, so a facade cannot restore a terrace. */
export function photoScene(input: ConstructorInput) {
  const variant = input.facade === 'timber'
    ? input.terrace ? 'base' : 'terrace-no'
    : `facade-${input.facade}${input.terrace ? '' : '-entry'}`
  return `${approvedPhotoRoot}/${sceneSize(input)}/${variant}.webp`
}

/** Navigation is absent: selected materials persist across all steps. */
export function photoLayers(input: ConstructorInput) {
  const root = `${approvedPhotoRoot}/${sceneSize(input)}`
  return {
    base: photoScene(input),
    // The base has standing seams; even metal tile requires its selected layer.
    roof: `${root}/roof-${input.roof}.webp`,
    foundation: input.foundation === 'screw' ? null : `${root}/foundation-concrete.webp`,
  }
}

export function insulationPhoto(value: ConstructorInput['insulation']) {
  return `/constructor/material-cutouts-v1/insulation-${value}.webp`
}

export function houseDimensions(input: ConstructorInput) {
  if (input.size === 'custom') return null
  const [width, depth] = input.size.split('x').map(Number)
  return { width, depth }
}
