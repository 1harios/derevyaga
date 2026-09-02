'use client'

import { forwardRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Stepper } from '@/components/ui/Stepper'
import { constructorConfig, type MortgageProgramId } from '@/lib/constructor/config'
import { estimateMortgage } from '@/lib/constructor/engine'
import { track } from '@/lib/analytics'
import { cn, formatPrice } from '@/lib/utils'

/**
 * Ипотека: явный выбор программы (семейная 6 % выделена), взнос, срок,
 * честный аннуитетный платёж и переплата. Считает от «Итого с доставкой».
 */
export const MortgagePanel = forwardRef<
  HTMLDivElement,
  { price: number; disabled: boolean; onRequest: () => void }
>(function MortgagePanel({ price, disabled, onRequest }, ref) {
  const {
    programs,
    downPaymentDefaultPct,
    downPaymentMinPct,
    downPaymentMaxPct,
    downPaymentStepPct,
    termsYears,
    defaultTermYears,
  } = constructorConfig.mortgage

  const [program, setProgram] = useState<MortgageProgramId>('family')
  const [downPct, setDownPct] = useState<number>(downPaymentDefaultPct)
  const [years, setYears] = useState<number>(defaultTermYears)

  const mortgage = estimateMortgage(price, { program, downPaymentPct: downPct, termYears: years })
  const active = programs.find((item) => item.id === program) ?? programs[0]

  return (
    <div ref={ref} className="card scroll-mt-24 rounded-xl p-6 md:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        <div>
          <p className="eyebrow mb-3">Купить в ипотеку</p>
          <h2 className="text-[clamp(1.35rem,1.1rem+1vw,1.75rem)]">
            {disabled ? 'Ипотека на дом любого размера' : `Этот дом в ипотеку — от ${formatPrice(mortgage.monthly)} в месяц`}
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-[1.6] text-ink-soft">
            Работаем и с семейной, и с обычной ипотекой, а также с материнским капиталом. Документы для
            банка готовим сами. Выберите программу — платёж пересчитается сразу.
          </p>

          <fieldset className="mt-6">
            <legend className="field-label mb-3">Программа</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {programs.map((item) => {
                const selected = item.id === program
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setProgram(item.id)
                      track('mortgage_program', { program: item.id })
                    }}
                    className={cn(
                      'relative flex flex-col gap-1 rounded-xl border p-4 text-left transition-[border-color,background-color] duration-200',
                      selected ? 'border-dark bg-dark text-white' : 'border-line bg-surface hover:border-ink/40',
                    )}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-heading text-[16px] font-medium">{item.label}</span>
                      {item.highlight ? (
                        <span className={cn('chip text-[11px]', selected ? 'bg-white/15 text-white' : 'chip--brand')}>
                          выгодно
                        </span>
                      ) : null}
                    </span>
                    <span className={cn('num text-[26px]', selected ? 'text-white' : 'text-ink')}>
                      {String(item.rate).replace('.', ',')} %
                    </span>
                    <span className={cn('text-[12.5px] leading-snug', selected ? 'text-white/70' : 'text-ink-soft')}>
                      {item.note}
                    </span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <Stepper
                label="Первоначальный взнос"
                unit="%"
                min={downPaymentMinPct}
                max={downPaymentMaxPct}
                step={downPaymentStepPct}
                value={downPct}
                onChange={setDownPct}
              />
              {!disabled ? (
                <p className="mt-2 text-[13px] text-ink-soft">
                  {formatPrice(mortgage.downPayment)} — можно материнским капиталом
                </p>
              ) : null}
            </div>

            <fieldset>
              <legend className="field-label mb-3">Срок</legend>
              <div className="flex flex-wrap gap-2">
                {termsYears.map((term) => (
                  <button
                    key={term}
                    type="button"
                    aria-pressed={term === years}
                    onClick={() => setYears(term)}
                    className={cn(
                      'chip min-h-10 px-4 text-[14px] transition-colors',
                      term === years ? 'bg-dark text-white' : 'bg-panel hover:bg-line',
                    )}
                  >
                    {term} лет
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        </div>

        <div className="on-dark flex flex-col rounded-xl bg-dark p-6 text-white">
          <p className="text-[13px] text-white/60">Ежемесячный платёж · {active.label.toLowerCase()}</p>
          <p className="num mt-2 text-[clamp(2rem,1.5rem+1.5vw,2.75rem)]">
            {disabled ? '—' : `${formatPrice(mortgage.monthly)}/мес`}
          </p>

          {!disabled ? (
            <dl className="mt-5 space-y-2 border-t border-white/12 pt-5 text-[14px]">
              <div className="flex justify-between gap-4">
                <dt className="text-white/60">Сумма кредита</dt>
                <dd className="num">{formatPrice(mortgage.loan)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/60">Ставка</dt>
                <dd className="num">{String(mortgage.rate).replace('.', ',')} %</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/60">Переплата за {years} лет</dt>
                <dd className="num">{formatPrice(mortgage.overpayment)}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-5 text-[14px] leading-[1.55] text-white/70">
              Выберите размер из линейки или отправьте свои размеры — посчитаем цену и платёж вместе.
            </p>
          )}

          <div className="mt-auto pt-6">
            <Button variant="light" wide arrow onClick={onRequest}>
              Подобрать ипотеку
            </Button>
            <p className="mt-3 text-[12px] leading-[1.5] text-white/55">
              Расчёт ориентировочный: одобрение, ставку и лимит определяет банк.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})
