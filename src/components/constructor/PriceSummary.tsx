'use client'

import { Button } from '@/components/ui/Button'
import { constructorConfig } from '@/lib/constructor/config'
import { estimateMortgage, type ConstructorInput, type HouseEstimate, type MortgageInput } from '@/lib/constructor/engine'
import { cn } from '@/lib/utils'
import { AnimatedPrice } from './AnimatedPrice'

export function PriceSummary({ input, estimate, mortgageInput, onSave, onMortgage, className }: {
  input: ConstructorInput; estimate: HouseEstimate; mortgageInput: MortgageInput
  onSave: () => void; onMortgage: () => void; className?: string
}) {
  const mortgage = estimateMortgage(estimate.total, mortgageInput)
  const program = constructorConfig.mortgage.programs.find((item) => item.id === mortgageInput.program)!
  return <div className={cn('constructor-total', className)} aria-live="polite" aria-atomic="true">
    <div className="constructor-total-figures">
      <div><span className="constructor-total-label">Предварительная цена</span><strong>{estimate.custom ? 'По запросу' : <AnimatedPrice value={estimate.total} />}</strong><span className="constructor-total-note">{input.distanceKm ? 'Сборка, сваи и доставка' : 'Со сборкой и сваями · без доставки'}</span></div>
      <button type="button" className="constructor-monthly" onClick={onMortgage}><span className="constructor-total-label">В ипотеку · {String(program.rate).replace('.', ',')} % ↗</span><strong>{estimate.custom ? '—' : <AnimatedPrice value={mortgage.monthly} />}<small>/мес</small></strong><span className="constructor-total-note">{mortgageInput.downPaymentPct} % взнос · {mortgageInput.termYears} лет</span></button>
    </div>
    <Button wide arrow onClick={onSave}>{estimate.custom ? 'Рассчитать мой размер' : 'Получить расчёт'}</Button>
  </div>
}
