'use client'

import { useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { LeadForm } from '@/components/ui/LeadForm'
import { Stepper } from '@/components/ui/Stepper'
import { constructorConfig } from '@/lib/constructor/config'
import {
  defaultConstructorInput,
  describeInput,
  estimateHouse,
  estimateMortgage,
  type ConstructorInput,
} from '@/lib/constructor/engine'
import { track } from '@/lib/analytics'
import { cn, formatPrice } from '@/lib/utils'
import { HouseVisual } from './HouseVisual'
import { MortgagePanel } from './MortgagePanel'
import { OptionCards } from './OptionCards'
import { PriceSummary } from './PriceSummary'
import { STEPS, houseImage, imagesForStep, pilesImage, roofImage, sizeIcon, visualFor } from './visuals'

const cfg = constructorConfig

type FormKind = 'constructor' | 'constructor-mortgage'

/**
 * Конструктор дома: слева дом, который собирается по мере выбора, и живой итог;
 * справа семь шагов с карточками вариантов. Ниже — ипотека с выбором программы,
 * плашки доверия и форма «Сохранить расчёт» (уходит в amoCRM как обычная заявка,
 * строка расчёта — в поле calculationId).
 */
export function HouseConstructor() {
  const [input, setInput] = useState<ConstructorInput>(defaultConstructorInput)
  const [stepIndex, setStepIndex] = useState(0)
  const [form, setForm] = useState<FormKind | null>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const mortgageRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  const estimate = useMemo(() => estimateHouse(input), [input])
  const step = STEPS[stepIndex]
  const visual = visualFor(step.id, input)
  const nextStep = STEPS[stepIndex + 1]
  const prefetch = nextStep ? imagesForStep(nextStep.id, input) : []
  const isCustom = input.size === 'custom'
  const size = cfg.sizes.find((item) => item.id === input.size) ?? cfg.sizes[0]

  const patch = (next: Partial<ConstructorInput>) => setInput((prev) => ({ ...prev, ...next }))

  const goTo = (index: number, scrollToSteps = false) => {
    const clamped = Math.min(Math.max(index, 0), STEPS.length - 1)
    setStepIndex(clamped)
    track('constructor_step', { step: STEPS[clamped].id })
    // На телефоне шаги стоят под картинкой — подводим к ним, чтобы не терять место
    if (scrollToSteps && window.matchMedia('(max-width: 1023px)').matches) {
      window.requestAnimationFrame(() =>
        stepsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      )
    }
  }

  const openForm = (kind: FormKind) => {
    setForm(kind)
    track(kind === 'constructor' ? 'constructor_save' : 'constructor_mortgage', {
      size: input.size,
      total: estimate.total,
    })
    window.requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    )
  }

  /** Подпись цены опции: надбавка за м² × площадь выбранного дома */
  const priceFor = (pricePerM2: number) =>
    isCustom ? 'по запросу' : pricePerM2 ? `+ ${formatPrice(pricePerM2 * size.area)}` : 'в цене'

  // Платёж по выделенной программе (семейная) с параметрами по умолчанию — приписки «₽/мес» к ценам
  const family = cfg.mortgage.programs.find((item) => item.highlight) ?? cfg.mortgage.programs[0]
  const monthlyFor = (price: number) =>
    estimateMortgage(price, {
      program: family.id,
      downPaymentPct: cfg.mortgage.downPaymentDefaultPct,
      termYears: cfg.mortgage.defaultTermYears,
    }).monthly
  /** «+ 135 ₽/мес» к надбавке за м²; для базовых вариантов и «Другого» — пусто */
  const monthlyNote = (pricePerM2: number) =>
    isCustom || !pricePerM2 ? undefined : `+ ${formatPrice(monthlyFor(pricePerM2 * size.area))}/мес`

  function renderStep() {
    switch (step.id) {
      case 'size':
        return (
          <OptionCards
            label="Выберите размер по внешнему контуру"
            value={input.size}
            onChange={(id) => patch({ size: id })}
            options={cfg.sizes.map((item) => ({
              id: item.id,
              label: item.label,
              note: item.id === 'custom' ? item.note : `${item.area} м² · ${item.note}`,
              price: item.id === 'custom' ? 'по запросу' : `от ${formatPrice(item.basePrice)}`,
              priceNote: item.id === 'custom' ? undefined : `от ${formatPrice(monthlyFor(item.basePrice))}/мес`,
              // Иконки размеров: дом каждого размера в базовой комплектации, «Другой» — эскиз
              thumb: { src: sizeIcon(item.id), alt: item.id === 'custom' ? 'Дом по вашему эскизу' : `Дом ${item.label}` },
            }))}
          />
        )

      case 'foundation':
        return (
          <div className="space-y-4">
            <OptionCards
              label="Тип свай"
              value={input.foundation}
              onChange={(id) => patch({ foundation: id })}
              columns={2}
              options={cfg.foundations.map((item) => ({
                id: item.id,
                label: item.label,
                note: item.note,
                price: isCustom
                  ? 'по проекту'
                  : `${size.piles} свай · ${formatPrice(size.piles * item.pricePerPile)}`,
                priceNote: isCustom ? undefined : `${formatPrice(monthlyFor(size.piles * item.pricePerPile))}/мес`,
                thumb: { src: pilesImage(input.size, item.id), alt: item.label },
              }))}
            />
            <p className="text-[13px] leading-[1.5] text-ink-soft">
              Количество свай зависит от размера дома
              {isCustom ? ' — посчитаем после замера' : `: ${size.piles} шт для ${size.label}`}. Цена
              указана за сваи с монтажом. Ленточный или плитный фундамент — по запросу.
            </p>
          </div>
        )

      case 'insulation':
        return (
          <OptionCards
            label="Утепление стен"
            value={input.insulation}
            onChange={(id) => patch({ insulation: id })}
            options={cfg.insulation.map((item) => ({
              id: item.id,
              label: item.label,
              note: item.note,
              price: priceFor(item.pricePerM2),
              priceNote: monthlyNote(item.pricePerM2),
            }))}
          />
        )

      case 'roof':
        return (
          <OptionCards
            label="Материал кровли"
            value={input.roof}
            onChange={(id) => patch({ roof: id })}
            options={cfg.roofs.map((item) => ({
              id: item.id,
              label: item.label,
              note: item.note,
              price: priceFor(item.pricePerM2),
              priceNote: monthlyNote(item.pricePerM2),
              thumb: { src: roofImage(input.size, item.id), alt: `Кровля: ${item.label.toLowerCase()}` },
            }))}
          />
        )

      case 'facade':
        return (
          <OptionCards
            label="Материал фасада"
            value={input.facade}
            onChange={(id) => patch({ facade: id })}
            options={cfg.facades.map((item) => ({
              id: item.id,
              label: item.label,
              note: item.note,
              price: priceFor(item.pricePerM2),
              priceNote: monthlyNote(item.pricePerM2),
              thumb: { src: houseImage(input.size, { ...input, facade: item.id }), alt: `Фасад: ${item.label.toLowerCase()}` },
            }))}
          />
        )

      case 'terrace':
        return (
          <OptionCards<'yes' | 'no'>
            label="Нужна ли терраса"
            columns={2}
            value={input.terrace ? 'yes' : 'no'}
            onChange={(id) => patch({ terrace: id === 'yes' })}
            options={[
              {
                id: 'yes',
                label: 'С террасой',
                note: 'открытая, вдоль фасада, под общей кровлей',
                price: isCustom ? 'по запросу' : 'в цене',
                thumb: { src: houseImage(input.size, { ...input, terrace: true }), alt: 'Дом с террасой' },
              },
              {
                id: 'no',
                label: 'Без террасы',
                note: 'компактнее, крыльцо у входа',
                price: isCustom ? 'по запросу' : `− ${formatPrice(cfg.terrace.removeDiscount)}`,
                priceNote: isCustom ? undefined : `− ${formatPrice(monthlyFor(cfg.terrace.removeDiscount))}/мес`,
                thumb: { src: houseImage(input.size, { ...input, terrace: false }), alt: 'Дом без террасы' },
              },
            ]}
          />
        )

      case 'delivery':
      default:
        return (
          <div className="grid gap-5 sm:grid-cols-2">
            <Stepper
              label={`Расстояние от ${cfg.deliveryOrigin.replace('посёлок ', 'п. ')}`}
              unit="км"
              min={0}
              max={cfg.delivery.maxKm}
              step={5}
              value={input.distanceKm}
              onChange={(distanceKm) => patch({ distanceKm })}
            />
            <div className="rounded-xl bg-panel p-5">
              <p className="text-[13px] text-ink-soft">Доставка и подача техники</p>
              <p className={input.distanceKm > 0 ? 'num mt-1 text-[22px]' : 'mt-1 text-[15px] text-ink-soft'}>
                {input.distanceKm > 0 ? formatPrice(estimate.delivery) : 'укажите расстояние — пока считаем без доставки'}
              </p>
              <p className="mt-2 text-[13px] leading-[1.5] text-ink-soft">
                Сборка входит в цену дома. Расстояние считаем от нашего производства в{' '}
                {cfg.deliveryOrigin.replace('посёлок ', 'посёлке ')} до участка — маршрут уточним
                при замере.
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <section id="constructor" className="py-6 md:py-10">
      <div className="shell">
        <div className="panel">
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-6">
            {/* Дом, который собирается, и живой итог */}
            <div className="stack lg:sticky lg:top-24">
              <HouseVisual
                src={visual.src}
                alt={visual.alt}
                caption={visual.caption}
                stepIndex={stepIndex}
                stepsTotal={STEPS.length}
                prefetch={prefetch}
              />
              <PriceSummary
                input={input}
                estimate={estimate}
                onEdit={(id) => goTo(STEPS.findIndex((item) => item.id === id), true)}
                onSave={() => openForm('constructor')}
                onMortgage={() => mortgageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              />
            </div>

            {/* Шаги */}
            <div ref={stepsRef} className="card scroll-mt-24 rounded-xl p-5 md:p-7">
              <ol className="flex flex-wrap gap-1.5" aria-label="Шаги конструктора">
                {STEPS.map((item, index) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => goTo(index)}
                      aria-current={index === stepIndex ? 'step' : undefined}
                      className={cn(
                        'chip min-h-9 gap-1.5 px-3 text-[13px] transition-colors',
                        index === stepIndex
                          ? 'bg-dark text-white'
                          : index < stepIndex
                            ? 'bg-brand-tint text-brand-deep hover:bg-brand-tint/70'
                            : 'bg-panel text-ink-soft hover:text-ink',
                      )}
                    >
                      <span className="num text-[11px] opacity-70">{index + 1}</span>
                      {item.short}
                    </button>
                  </li>
                ))}
              </ol>

              <div className="mt-6">
                <p className="eyebrow mb-2">
                  Шаг {stepIndex + 1} из {STEPS.length}
                </p>
                <h2 className="text-[clamp(1.25rem,1.05rem+0.8vw,1.6rem)]">{step.title}</h2>
                <p className="mt-2 max-w-[56ch] text-[13.5px] leading-[1.5] text-ink-soft">{step.hint}</p>
              </div>

              <div className="mt-5">{renderStep()}</div>

              <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-line pt-5">
                {stepIndex > 0 ? (
                  <Button variant="outline" onClick={() => goTo(stepIndex - 1, true)}>
                    Назад
                  </Button>
                ) : null}
                {stepIndex < STEPS.length - 1 ? (
                  <Button onClick={() => goTo(stepIndex + 1, true)} arrow>
                    <span className="whitespace-nowrap">Дальше: {nextStep?.short.toLowerCase()}</span>
                  </Button>
                ) : (
                  <Button onClick={() => openForm('constructor')} arrow>
                    Сохранить расчёт
                  </Button>
                )}
                <span className="text-[13px] leading-snug text-ink-soft">
                  Цена пересчитывается сразу — телефон нужен только чтобы сохранить расчёт
                </span>
              </div>

              <details className="group mt-6 rounded-xl bg-panel p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-heading text-[15px] font-medium">
                  Что входит в базовую комплектацию
                  <span aria-hidden className="text-[20px] leading-none text-ink-soft transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <dl className="mt-4 grid gap-x-6 gap-y-2.5 text-[14px] sm:grid-cols-2">
                  {cfg.baseSpec.map((item) => (
                    <div key={item.label} className="border-b border-black/[0.06] pb-2">
                      <dt className="text-[12.5px] text-ink-soft">{item.label}</dt>
                      <dd className="mt-0.5">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            </div>
          </div>

          {/* Ипотека */}
          <div className="mt-4 lg:mt-6">
            <MortgagePanel
              ref={mortgageRef}
              price={estimate.total}
              disabled={isCustom}
              onRequest={() => openForm('constructor-mortgage')}
            />
          </div>

          {/* Доверие */}
          <ul className="mt-4 grid gap-3 sm:grid-cols-3 lg:mt-6">
            {cfg.trust.map((item) => (
              <li key={item.title} className="rounded-xl bg-surface p-5 shadow-card">
                <p className="font-heading text-[17px] font-medium">{item.title}</p>
                <p className="mt-1 text-[14px] leading-[1.5] text-ink-soft">{item.text}</p>
              </li>
            ))}
          </ul>

          {/* Форма: сохранить расчёт или подобрать ипотеку */}
          {form ? (
            <div ref={formRef} className="mt-4 scroll-mt-24 lg:mt-6">
              <div className="card rounded-xl p-6 md:p-8">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
                  <div>
                    <p className="eyebrow mb-3">
                      {form === 'constructor' ? 'Сохранить расчёт' : 'Подбор ипотеки'}
                    </p>
                    <h2 className="text-[clamp(1.35rem,1.1rem+1vw,1.75rem)]">
                      {form === 'constructor'
                        ? 'Пришлём расчёт и смету в PDF'
                        : 'Подберём программу и подготовим документы для банка'}
                    </h2>
                    <p className="mt-3 text-[15px] leading-[1.6] text-ink-soft">
                      {isCustom
                        ? 'Расскажите размеры и пожелания в комментарии — посчитаем за два рабочих дня.'
                        : `Ваш расчёт: ${describeInput(input, estimate)}. Менеджер проверит участок и маршрут доставки и зафиксирует цену в договоре.`}
                    </p>
                  </div>
                  <LeadForm
                    formType={form}
                    submitLabel={form === 'constructor' ? 'Получить расчёт' : 'Подобрать ипотеку'}
                    calculationId={describeInput(input, estimate)}
                    area={isCustom ? undefined : estimate.area}
                    withComment={isCustom}
                    successNote={
                      form === 'constructor'
                        ? 'Расчёт и смета придут в течение рабочего дня. Нужно быстрее — напишите в Telegram, отправим сразу.'
                        : 'Менеджер уточнит состав семьи и доход, подберёт банк и программу и подготовит документы. Перезвоним в течение рабочего дня.'
                    }
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
