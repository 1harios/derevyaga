'use client'

import { Button } from '@/components/ui/Button'
import { constructorConfig } from '@/lib/constructor/config'
import { clampDistance, estimateMortgage, type ConstructorInput, type HouseEstimate } from '@/lib/constructor/engine'
import { cn, formatPrice } from '@/lib/utils'

/**
 * Живой итог под сценой: две цифры одинакового веса — цена дома и платёж по
 * семейной ипотеке — плюс кнопка «Сохранить расчёт». Состав цены — одной строкой.
 */
export function PriceSummary({
  input,
  estimate,
  onSave,
  onMortgage,
  className,
}: {
  input: ConstructorInput
  estimate: HouseEstimate
  onSave: () => void
  onMortgage: () => void
  className?: string
}) {
  const { mortgage } = constructorConfig
  const family = mortgage.programs.find((item) => item.highlight) ?? mortgage.programs[0]
  const monthly = estimateMortgage(estimate.total, {
    program: family.id,
    downPaymentPct: mortgage.downPaymentDefaultPct,
    termYears: mortgage.defaultTermYears,
  }).monthly
  const hasDistance = clampDistance(input.distanceKm) > 0
  const breakdown = estimate.custom
    ? `посчитаем по вашему эскизу за два рабочих дня — та же сборка за ${constructorConfig.buildDays} дней`
    : [
        `дом ${formatPrice(estimate.house)}`,
        `сваи ${formatPrice(estimate.piles.price)}`,
        hasDistance ? `доставка ${formatPrice(estimate.delivery)}` : 'доставка — укажите км',
      ].join(' · ')

  const figure = 'num mt-1 text-[clamp(1.55rem,1.15rem+1.2vw,2.1rem)] leading-none tracking-tight whitespace-nowrap'

  return (
    <div className={cn('card rounded-xl p-4 md:p-5', className)}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <p className="text-[12.5px] text-ink-soft">
            {estimate.custom ? 'Другой размер' : hasDistance ? 'Цена с доставкой' : 'Цена без доставки'}
          </p>
          <p className={figure}>{estimate.custom ? 'по запросу' : formatPrice(estimate.total)}</p>
          <p className="mt-1.5 text-[12px] leading-snug text-ink-soft">{breakdown}</p>
        </div>

        <div className="min-w-0 sm:border-l sm:border-line sm:pl-4">
          <p className="text-[12.5px] text-ink-soft">
            {family.label} {family.rate} %
          </p>
          <p className={cn(figure, 'text-brand-deep')}>{estimate.custom ? '—' : `от ${formatPrice(monthly)}/мес`}</p>
          <p className="mt-1.5 text-[12px] leading-snug text-ink-soft">
            взнос {mortgage.downPaymentDefaultPct} % · {mortgage.defaultTermYears} лет ·{' '}
            <button type="button" onClick={onMortgage} className="link-underline text-ink-soft hover:text-ink">
              подобрать программу
            </button>
          </p>
        </div>

        <div className="sm:col-span-2 lg:col-span-1">
          <Button onClick={onSave} arrow className="w-full justify-center lg:w-auto">
            <span className="whitespace-nowrap">{estimate.custom ? 'Отправить размеры' : 'Сохранить расчёт'}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
