import {
  pricing,
  type Completeness,
  type EngineeringOption,
  type FacadeOption,
  type FloorsOption,
  type FoundationOption,
  type InsulationOption,
  type RoofOption,
  type WindowsOption,
} from './pricing.config'

/**
 * Один расчётный движок на два входа: короткий квиз на главной и полный
 * калькулятор на /calculator. Функция чистая — её можно звать и на клиенте
 * для живого пересчёта, и на сервере при сохранении расчёта и генерации PDF.
 */

export type CalcInput = {
  area: number
  floors: FloorsOption
  bedrooms?: number
  foundation: FoundationOption
  completeness: Completeness
  roof: RoofOption
  facade: FacadeOption
  insulation: InsulationOption
  windows: WindowsOption
  engineering: EngineeringOption
  terraceArea: number
  distanceKm: number
}

export type CalcResult = {
  priceFrom: number
  priceTo: number
  pricePerM2: number
  days: number
  breakdown: { label: string; value: number }[]
  payments: { stage: string; share: number; amount: number }[]
}

export const defaultCalcInput: CalcInput = {
  area: 132,
  floors: '2',
  bedrooms: 4,
  foundation: 'piles',
  completeness: 'turnkey',
  roof: 'metal',
  facade: 'imitation',
  insulation: '200',
  windows: 'standard',
  engineering: 'basic',
  terraceArea: 0,
  distanceKm: 30,
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function calculate(input: CalcInput): CalcResult {
  const area = clamp(Math.round(input.area), 40, 400)
  const terraceArea = clamp(Math.round(input.terraceArea), 0, 120)
  const distanceKm = clamp(Math.round(input.distanceKm), 0, pricing.distance.maxKm)

  const base = pricing.basePerM2[input.completeness]
  const factor =
    pricing.floors[input.floors] *
    pricing.foundation[input.foundation] *
    pricing.roof[input.roof] *
    pricing.facade[input.facade] *
    pricing.insulation[input.insulation] *
    pricing.windows[input.windows]

  const houseCost = area * base * factor

  // В «под ключ» базовая инженерия уже внутри базовой цены
  const engineeringRate =
    input.completeness === 'turnkey' && input.engineering === 'basic'
      ? 0
      : pricing.engineeringPerM2[input.engineering]
  const engineeringCost = area * engineeringRate

  const terraceCost = terraceArea * pricing.terracePerM2

  const extraKm = Math.max(0, distanceKm - pricing.distance.freeKm)
  const logisticsCost = extraKm * pricing.distance.pricePerKm

  const total = houseCost + engineeringCost + terraceCost + logisticsCost

  const priceFrom = roundTo(total * (1 - pricing.spread), 10_000)
  const priceTo = roundTo(total * (1 + pricing.spread), 10_000)

  const days = Math.round(
    (pricing.duration.baseDays + area * pricing.duration.daysPerM2) *
      pricing.duration.completenessFactor[input.completeness] *
      pricing.duration.floorsFactor[input.floors],
  )

  const breakdown = [
    { label: 'Дом в выбранной комплектации', value: roundTo(houseCost, 1_000) },
    ...(engineeringCost > 0
      ? [{ label: 'Инженерные системы', value: roundTo(engineeringCost, 1_000) }]
      : []),
    ...(terraceCost > 0
      ? [{ label: `Терраса ${terraceArea} м²`, value: roundTo(terraceCost, 1_000) }]
      : []),
    ...(logisticsCost > 0
      ? [{ label: `Логистика, ${extraKm} км за пределами города`, value: roundTo(logisticsCost, 1_000) }]
      : []),
  ]

  const payments = pricing.paymentSchedule.map((item) => ({
    stage: item.stage,
    share: item.share,
    amount: roundTo(priceFrom * item.share, 1_000),
  }))

  return {
    priceFrom,
    priceTo,
    pricePerM2: Math.round(total / area),
    days,
    breakdown,
    payments,
  }
}

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step
}

/** Подписи для интерфейса — держим рядом с движком, чтобы не расходились */
export const optionLabels = {
  floors: { '1': 'Один этаж', '1.5': 'С мансардой', '2': 'Два этажа' },
  foundation: { piles: 'Свайно-винтовой', strip: 'Ленточный', slab: 'Монолитная плита' },
  completeness: { frame: 'Каркас', prefinish: 'Под чистовую', turnkey: 'Под ключ' },
  roof: { metal: 'Металлочерепица', soft: 'Гибкая черепица', seam: 'Фальцевая' },
  facade: { imitation: 'Имитация бруса', planken: 'Планкен', plaster: 'Штукатурка' },
  insulation: { '150': '150 мм', '200': '200 мм', '250': '250 мм' },
  windows: { standard: 'Стандартные', enlarged: 'Увеличенные' },
  engineering: { none: 'Без инженерии', basic: 'Базовая', full: 'Полная' },
} as const
