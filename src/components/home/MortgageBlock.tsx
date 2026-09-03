'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Stepper } from '@/components/ui/Stepper'
import { cn, formatPrice } from '@/lib/utils'

/** ЗАМЕНИТЬ: ставки программ — заглушки, уточните у банков-партнёров */
const PROGRAMS = [
  { id: 'family', label: 'Семейная ипотека', rate: 6 },
  { id: 'it', label: 'IT-ипотека', rate: 6 },
  { id: 'base', label: 'Базовая на ИЖС', rate: 17.5 },
] as const

const METHODS = [
  {
    title: 'Дом в ипотеку',
    text: 'Работаем с ипотекой на ИЖС: готовим договор подряда и смету в форме банка за два рабочих дня.',
  },
  {
    title: 'Материнский капитал',
    text: 'Деньги приходят двумя частями — после договора и после подтверждения основных работ. Это заложено в график платежей.',
  },
  {
    title: 'Рассрочка от компании',
    text: 'Платежи привязаны к принятым этапам, без процентов и переплаты. Не приняли этап — не платите.',
  },
  {
    title: 'Безналичный расчёт',
    text: 'Все платежи на расчётный счёт компании, с закрывающими документами. Наличные не принимаем.',
  },
]

export function MortgageBlock() {
  const [price, setPrice] = useState(5_640_000)
  const [downPercent, setDownPercent] = useState(20)
  const [years, setYears] = useState(20)
  const [program, setProgram] = useState<(typeof PROGRAMS)[number]['id']>('family')

  const rate = PROGRAMS.find((item) => item.id === program)?.rate ?? 6

  const monthly = useMemo(() => {
    const loan = price * (1 - downPercent / 100)
    const monthlyRate = rate / 100 / 12
    const months = years * 12
    if (monthlyRate === 0) return loan / months
    return (loan * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
  }, [price, downPercent, years, rate])

  return (
    <Section id="mortgage">
      <SectionHeader align="center" title="Мы предлагаем способы оплаты" />

      <div className="mb-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {METHODS.map((method, index) => {
          const dark = index % 2 === 1
          return (
            <article
              key={method.title}
              className={cn('flex flex-col rounded-xl p-6', dark ? 'on-dark bg-dark text-white' : 'card')}
            >
              <h3 className="text-[17px]">{method.title}</h3>
              <p className="muted mt-3 text-[14px] leading-[1.55]">{method.text}</p>
              <span
                aria-hidden
                className={cn(
                  'mt-auto flex size-9 items-center justify-center self-end rounded-full pt-0',
                  dark ? 'bg-white text-ink' : 'bg-dark text-white',
                )}
              >
                <svg viewBox="0 0 14 14" className="size-3.5">
                  <path
                    d="M3 3h8v8M11 3 3 11"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </article>
          )
        })}
      </div>

      <div className="panel">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:gap-12">
          <div>
            <h3 className="text-[20px]">Калькулятор платежа</h3>
            <p className="mt-2 text-[15px] muted">
              Считаем со ставкой программы, а не с рекламной цифрой из баннера.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Stepper
                label="Стоимость дома"
                unit="₽"
                min={2_000_000}
                max={20_000_000}
                step={100_000}
                value={price}
                onChange={setPrice}
                grouped
              />
              <Stepper
                label="Первый взнос"
                unit="%"
                min={15}
                max={90}
                step={5}
                value={downPercent}
                onChange={setDownPercent}
              />
              <Stepper label="Срок" unit="лет" min={3} max={30} value={years} onChange={setYears} />
              <div>
                <span className="field-label">Программа</span>
                <div className="grid gap-2">
                  {PROGRAMS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setProgram(item.id)}
                      aria-pressed={program === item.id}
                      className={cn(
                        'flex min-h-11 items-center justify-between rounded-md border px-4 text-left text-[14px] transition-colors duration-200 ease-out',
                        program === item.id
                          ? 'border-dark bg-dark text-white'
                          : 'border-line bg-surface text-ink hover:border-ink-faint',
                      )}
                    >
                      <span>{item.label}</span>
                      <span className="tabular-nums">{item.rate}%</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 rounded-xl bg-panel p-6">
            <div>
              <div className="text-[14px] muted">Платёж в месяц</div>
              <div className="num mt-2 text-[clamp(1.8rem,1.4rem+1.6vw,2.5rem)]">
                {formatPrice(monthly)}
              </div>

              <dl className="mt-6 space-y-2 text-[14px]">
                <div className="flex justify-between gap-4">
                  <dt className="muted">Первый взнос</dt>
                  <dd className="tabular-nums">{formatPrice((price * downPercent) / 100)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="muted">Сумма кредита</dt>
                  <dd className="tabular-nums">{formatPrice(price * (1 - downPercent / 100))}</dd>
                </div>
              </dl>
            </div>

            <div>
              <Button href="#final-form" wide arrow>
                Подобрать программу
              </Button>
              <p className="mt-4 text-[13px] leading-[1.45] muted">
                Расчёт предварительный: банк считает по своей формуле и учитывает страховку.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
