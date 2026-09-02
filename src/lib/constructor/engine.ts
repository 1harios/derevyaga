import { formatPrice } from '@/lib/utils'
import {
  constructorConfig,
  type FacadeId,
  type FoundationId,
  type InsulationId,
  type MortgageProgramId,
  type RoofId,
  type SizeId,
} from './config'

export type ConstructorInput = {
  size: SizeId
  foundation: FoundationId
  insulation: InsulationId
  roof: RoofId
  facade: FacadeId
  terrace: boolean
  /** Расстояние от Янино до участка, км */
  distanceKm: number
}

export const defaultConstructorInput: ConstructorInput = {
  size: '6x6',
  foundation: 'screw',
  insulation: '100',
  roof: 'ondulin',
  facade: 'timber',
  terrace: true,
  // Как в прайсе: пока расстояние не указано, итог показываем без доставки
  distanceKm: 0,
}

export type PriceLine = { label: string; value: number; note?: string }

export type HouseEstimate = {
  /** Дом со сборкой с учётом выбранных опций (без свай и доставки) */
  house: number
  piles: { count: number; price: number; label: string; short: string }
  delivery: number
  total: number
  area: number
  /** Разложение цены дома для строки «изменить» */
  lines: PriceLine[]
  /** Размер «Другой» — цену не показываем, зовём на расчёт */
  custom: boolean
}

const { sizes, foundations, insulation, roofs, facades, terrace, delivery } = constructorConfig

function option<T extends { id: string }>(list: readonly T[], id: string): T {
  return list.find((item) => item.id === id) ?? list[0]
}

export function clampDistance(km: number): number {
  if (!Number.isFinite(km)) return 0
  return Math.min(Math.max(Math.round(km), 0), delivery.maxKm)
}

export function deliveryPrice(km: number): number {
  return delivery.base + clampDistance(km) * delivery.perKm
}

export function estimateHouse(input: ConstructorInput): HouseEstimate {
  const size = option(sizes, input.size)
  if (size.id === 'custom') {
    return {
      house: 0,
      piles: { count: 0, price: 0, label: '', short: '' },
      delivery: 0,
      total: 0,
      area: 0,
      lines: [],
      custom: true,
    }
  }

  const foundation = option(foundations, input.foundation)
  const ins = option(insulation, input.insulation)
  const roof = option(roofs, input.roof)
  const facade = option(facades, input.facade)

  const lines: PriceLine[] = [
    { label: `Дом ${size.label} со сборкой, базовая комплектация`, value: size.basePrice },
  ]
  if (ins.pricePerM2) lines.push({ label: `Утепление ${ins.label}`, value: ins.pricePerM2 * size.area })
  if (roof.pricePerM2) lines.push({ label: roof.label, value: roof.pricePerM2 * size.area })
  if (facade.pricePerM2) lines.push({ label: facade.label, value: facade.pricePerM2 * size.area })
  if (!input.terrace) lines.push({ label: 'Без террасы', value: -terrace.removeDiscount })

  const house = lines.reduce((sum, line) => sum + line.value, 0)
  const piles = {
    count: size.piles,
    price: size.piles * foundation.pricePerPile,
    label: foundation.label,
    short: foundation.short,
  }
  const deliveryCost = deliveryPrice(input.distanceKm)

  return {
    house,
    piles,
    delivery: deliveryCost,
    total: house + piles.price + deliveryCost,
    area: size.area,
    lines,
    custom: false,
  }
}

export type MortgageInput = {
  program: MortgageProgramId
  downPaymentPct: number
  termYears: number
}

export type MortgageEstimate = {
  rate: number
  downPayment: number
  loan: number
  monthly: number
  totalPaid: number
  overpayment: number
}

/** Аннуитетный платёж: P · r / (1 − (1 + r)^−n), r — месячная ставка, n — месяцев */
export function estimateMortgage(price: number, input: MortgageInput): MortgageEstimate {
  const program = option(constructorConfig.mortgage.programs, input.program)
  const downPayment = Math.round((price * input.downPaymentPct) / 100)
  const loan = Math.max(price - downPayment, 0)
  const r = program.rate / 100 / 12
  const n = Math.max(1, Math.round(input.termYears * 12))
  const monthly = loan > 0 ? Math.round((loan * r) / (1 - Math.pow(1 + r, -n))) : 0
  const totalPaid = monthly * n
  return {
    rate: program.rate,
    downPayment,
    loan,
    monthly,
    totalPaid,
    overpayment: Math.max(totalPaid - loan, 0),
  }
}

/** Короткая строка расчёта для заявки в amoCRM (до 120 символов) */
export function describeInput(input: ConstructorInput, estimate: HouseEstimate): string {
  const size = option(sizes, input.size)
  const parts = [
    size.label,
    input.terrace ? 'терраса' : 'без террасы',
    `утепл. ${option(insulation, input.insulation).label}`,
    option(roofs, input.roof).label.toLowerCase(),
    option(facades, input.facade).label.toLowerCase(),
    estimate.custom ? '' : `${estimate.piles.count} свай (${estimate.piles.short})`,
    `${clampDistance(input.distanceKm)} км`,
    estimate.custom ? 'индивидуально' : formatPrice(estimate.total),
  ].filter(Boolean)
  return parts.join(' · ').slice(0, 120)
}
