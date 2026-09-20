'use client'

import { forwardRef } from 'react'
import { Button } from '@/components/ui/Button'
import { constructorConfig } from '@/lib/constructor/config'
import { estimateMortgage, type MortgageInput } from '@/lib/constructor/engine'
import { formatPrice } from '@/lib/utils'

export const MortgagePanel = forwardRef<HTMLDivElement, {
  price: number; disabled: boolean; value: MortgageInput; onChange: (value: MortgageInput) => void; onRequest: () => void
}>(function MortgagePanel({ price, disabled, value, onChange, onRequest }, ref) {
  const cfg = constructorConfig.mortgage
  const result = estimateMortgage(price, value)
  const patch = (next: Partial<MortgageInput>) => onChange({ ...value, ...next })
  return <div ref={ref} className="photo-mortgage scroll-mt-24">
    <div className="photo-mortgage-heading"><h2>Ипотека<span>на ваш будущий дом</span></h2></div>
    <div className="photo-mortgage-fields">
      <label>Программа<select value={value.program} onChange={e => patch({ program: e.target.value as MortgageInput['program'] })}>{cfg.programs.map(p => <option key={p.id} value={p.id}>{p.label} · {String(p.rate).replace('.', ',')}%</option>)}</select></label>
      <label>Срок кредита<select value={value.termYears} onChange={e => patch({ termYears: Number(e.target.value) })}>{cfg.termsYears.map(year => <option key={year} value={year}>{year} лет</option>)}</select></label>
      <label>Первоначальный взнос<select value={value.downPaymentPct} onChange={e => patch({ downPaymentPct: Number(e.target.value) })}>{Array.from({ length: (cfg.downPaymentMaxPct - cfg.downPaymentMinPct) / cfg.downPaymentStepPct + 1 }, (_, i) => cfg.downPaymentMinPct + i * cfg.downPaymentStepPct).map(pct => <option key={pct} value={pct}>{pct}%</option>)}</select></label>
    </div>
    <div className="photo-mortgage-payment"><span>Ежемесячный платёж</span><strong aria-live="polite">{disabled ? 'По запросу' : formatPrice(result.monthly)}</strong><Button variant="light" size="sm" arrow onClick={onRequest}>Подобрать ипотеку</Button></div>
    <details className="photo-mortgage-details"><summary>Подробности расчёта</summary><dl><div><dt>Стоимость дома</dt><dd>{disabled ? '—' : formatPrice(price)}</dd></div><div><dt>Первоначальный взнос</dt><dd>{disabled ? '—' : formatPrice(result.downPayment)}</dd></div><div><dt>Сумма кредита</dt><dd>{disabled ? '—' : formatPrice(result.loan)}</dd></div><div><dt>Переплата за {value.termYears} лет</dt><dd>{disabled ? '—' : formatPrice(result.overpayment)}</dd></div></dl><p>{cfg.programs.find(p => p.id === value.program)!.note}. Предварительный расчёт. Условия и одобрение определяет банк.</p></details>
  </div>
})
