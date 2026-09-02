'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo, useRef, useState } from 'react'
import { CalcSummary } from '@/components/home/CalcSummary'
import { Button } from '@/components/ui/Button'
import { LeadForm } from '@/components/ui/LeadForm'
import { ProgressBar } from '@/components/ui/Primitives'
import { OptionGroup, Stepper } from '@/components/ui/Stepper'
import { complectations } from '@/content/complectations'
import { track } from '@/lib/analytics'
import { calculate, defaultCalcInput, optionLabels, type CalcInput } from '@/lib/pricing/engine'
import { formatNumber } from '@/lib/utils'

const STEPS = ['Дом', 'Комплектация', 'Основание и кровля', 'Участок'] as const

export function QuizCalculator({ showIntro = true }: { showIntro?: boolean } = {}) {
  const search = useSearchParams()
  const [step, setStep] = useState(0)
  // Предзаполнение из query-параметров: селекты в герое главной ведут сюда
  // со своей комплектацией и этажностью (?completeness=turnkey&floors=2)
  const [input, setInput] = useState<CalcInput>(() => {
    const completeness = search.get('completeness')
    const floors = search.get('floors')
    return {
      ...defaultCalcInput,
      ...(completeness === 'frame' || completeness === 'prefinish' || completeness === 'turnkey'
        ? { completeness }
        : null),
      ...(floors === '1' || floors === '1.5' || floors === '2' ? { floors } : null),
    }
  })
  const [showForm, setShowForm] = useState(false)
  const summaryRef = useRef<HTMLDivElement>(null)

  const result = useMemo(() => calculate(input), [input])
  const patch = (next: Partial<CalcInput>) => setInput((prev) => ({ ...prev, ...next }))
  const isLast = step === STEPS.length - 1

  function goNext() {
    if (isLast) {
      setShowForm(true)
      track('calc_complete', { amount: result.priceFrom, area: input.area })
      // На телефоне итог стоит под шагами — подводим к нему,
      // иначе после «Показать смету» кажется, что ничего не произошло
      if (window.matchMedia('(max-width: 1023px)').matches) {
        window.requestAnimationFrame(() =>
          summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        )
      }
      return
    }
    setStep((value) => value + 1)
  }

  return (
    <section id="calculator" className="py-8 md:py-12">
      <div className="shell">
        <div className="panel">
          {/* На странице /calculator заголовок даёт PageHero — свой прячем */}
          {showIntro ? (
            <div className="mb-8 max-w-2xl">
              <p className="eyebrow mb-3">Калькулятор за 4 шага</p>
              <h2>Посчитайте свой дом за две минуты</h2>
              <p className="lead mt-4">
                Цена пересчитывается сразу, без ожидания менеджера. В конце покажем диапазон, срок
                и график платежей — телефон нужен только для подробной сметы в PDF.
              </p>
            </div>
          ) : null}

          <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-4">
            <div className="card rounded-xl p-6 md:p-8">
              <div className="mb-8">
                <ProgressBar
                  value={showForm && isLast ? 100 : ((step + 1) / STEPS.length) * 100}
                  label={
                    showForm && isLast
                      ? 'Готово: смета рассчитана'
                      : `Шаг ${step + 1} из ${STEPS.length}: ${STEPS[step]}`
                  }
                />
              </div>

              {step === 0 ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Stepper
                    label="Площадь дома"
                    unit="м²"
                    min={40}
                    max={400}
                    step={2}
                    value={input.area}
                    onChange={(area) => patch({ area })}
                  />
                  <Stepper
                    label="Спальни"
                    min={1}
                    max={6}
                    value={input.bedrooms ?? 3}
                    onChange={(bedrooms) => patch({ bedrooms })}
                  />
                  <div className="sm:col-span-2">
                    <OptionGroup
                      label="Этажность"
                      value={input.floors}
                      onChange={(floors) => patch({ floors })}
                      options={[
                        { value: '1', label: optionLabels.floors['1'], note: 'дешевле обслуживать' },
                        { value: '1.5', label: optionLabels.floors['1.5'], note: 'экономия на кровле' },
                        { value: '2', label: optionLabels.floors['2'], note: 'меньше цена за м²' },
                      ]}
                    />
                  </div>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="space-y-5">
                  <OptionGroup
                    label="Комплектация"
                    value={input.completeness}
                    onChange={(completeness) => patch({ completeness })}
                    options={complectations.map((item) => ({
                      value: item.id,
                      label: item.name,
                      note: `от ${formatNumber(item.pricePerM2)} ₽/м²`,
                    }))}
                  />
                  <OptionGroup
                    label="Инженерия"
                    value={input.engineering}
                    onChange={(engineering) => patch({ engineering })}
                    options={[
                      { value: 'none', label: optionLabels.engineering.none, note: 'только конструктив' },
                      { value: 'basic', label: optionLabels.engineering.basic, note: 'электрика, вода, тепло' },
                      { value: 'full', label: optionLabels.engineering.full, note: 'с вентиляцией' },
                    ]}
                  />
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-5">
                  <OptionGroup
                    label="Фундамент"
                    value={input.foundation}
                    onChange={(foundation) => patch({ foundation })}
                    options={[
                      { value: 'piles', label: optionLabels.foundation.piles, note: 'подходит большинству' },
                      { value: 'strip', label: optionLabels.foundation.strip, note: 'для плотных грунтов' },
                      { value: 'slab', label: optionLabels.foundation.slab, note: 'для сложных грунтов' },
                    ]}
                  />
                  <OptionGroup
                    label="Кровля"
                    value={input.roof}
                    onChange={(roof) => patch({ roof })}
                    options={[
                      { value: 'metal', label: optionLabels.roof.metal },
                      { value: 'soft', label: optionLabels.roof.soft },
                      { value: 'seam', label: optionLabels.roof.seam },
                    ]}
                  />
                  <OptionGroup
                    label="Фасад"
                    value={input.facade}
                    onChange={(facade) => patch({ facade })}
                    options={[
                      { value: 'imitation', label: optionLabels.facade.imitation },
                      { value: 'planken', label: optionLabels.facade.planken },
                      { value: 'plaster', label: optionLabels.facade.plaster },
                    ]}
                  />
                </div>
              ) : null}

              {step === 3 ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Stepper
                    label="Удалённость от КАД"
                    unit="км"
                    min={0}
                    max={300}
                    step={5}
                    value={input.distanceKm}
                    onChange={(distanceKm) => patch({ distanceKm })}
                  />
                  <Stepper
                    label="Терраса"
                    unit="м²"
                    min={0}
                    max={80}
                    step={2}
                    value={input.terraceArea}
                    onChange={(terraceArea) => patch({ terraceArea })}
                  />
                  <div className="sm:col-span-2">
                    <OptionGroup
                      label="Утепление стен"
                      value={input.insulation}
                      onChange={(insulation) => patch({ insulation })}
                      options={[
                        { value: '150', label: '150 мм', note: 'сезонное проживание' },
                        { value: '200', label: '200 мм', note: 'круглый год, наш стандарт' },
                        { value: '250', label: '250 мм', note: 'минимальные счета' },
                      ]}
                    />
                  </div>
                </div>
              ) : null}

              {/* На телефоне панель кнопок липнет к низу экрана над плавающей панелью CTA,
                  чтобы «Дальше» не приходилось искать прокруткой на длинных шагах */}
              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6 max-lg:sticky max-lg:bottom-[84px] max-lg:z-[5] max-lg:-mx-6 max-lg:bg-surface/95 max-lg:px-6 max-lg:pb-4 max-lg:backdrop-blur-sm md:max-lg:-mx-8 md:max-lg:px-8">
                {step > 0 ? (
                  <Button variant="outline" onClick={() => setStep((value) => value - 1)}>
                    Назад
                  </Button>
                ) : null}
                {showForm && isLast ? (
                  <p className="text-[14px] muted">
                    Смета готова: диапазон цены, срок и форма для PDF —{' '}
                    <span className="lg:hidden">ниже</span>
                    <span className="max-lg:hidden">справа</span>
                  </p>
                ) : (
                  <>
                    <Button onClick={goNext} arrow={isLast}>
                      {isLast ? 'Показать смету' : 'Дальше'}
                    </Button>
                    <span className="text-[14px] muted max-lg:hidden">
                      Без регистрации — телефон спросим только в конце
                    </span>
                  </>
                )}
              </div>
            </div>

            <div ref={summaryRef} className="stack scroll-mt-24">
              <CalcSummary result={result} compact={!showForm} />

              {showForm ? (
                <div className="card rounded-xl p-6">
                  <h3 className="text-[18px]">Подробная смета в PDF</h3>
                  <p className="mt-2 text-[14px] leading-[1.55] muted">
                    Пришлём состав работ по этапам, график платежей и что не входит в цену.
                  </p>
                  <div className="mt-5">
                    <LeadForm
                      formType="quiz-calculator"
                      submitLabel="Получить смету в PDF"
                      area={input.area}
                      successNote="Смета придёт в течение рабочего дня. Нужно быстрее — напишите в Telegram, отправим сразу после расчёта."
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
