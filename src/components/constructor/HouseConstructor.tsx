'use client'

import { useMemo, useRef, useState } from 'react'
import { LuRuler, LuLayers, LuHouse, LuPaintbrush, LuFence, LuGrid2X2, LuTruck, LuChevronDown } from 'react-icons/lu'
import { Button } from '@/components/ui/Button'
import { LeadForm } from '@/components/ui/LeadForm'
import { Stepper } from '@/components/ui/Stepper'
import { constructorConfig as cfg } from '@/lib/constructor/config'
import { defaultConstructorInput, describeInput, estimateHouse, type ConstructorInput, type MortgageInput } from '@/lib/constructor/engine'
import { track } from '@/lib/analytics'
import { formatPrice } from '@/lib/utils'
import { PhotoHouse } from './PhotoHouse'
import { MortgagePanel } from './MortgagePanel'
import { OptionCards } from './OptionCards'
import { OptionPreview } from './OptionPreview'
import { PriceSummary } from './PriceSummary'
import { type StepId } from './visuals'

const sections = [
  { id: 'size', title: 'Размер дома', icon: LuRuler, note: 'Выберите габариты, которые подходят вашему участку и образу жизни.' },
  { id: 'foundation', title: 'Фундамент', icon: LuGrid2X2, note: 'Сравните варианты свай. Окончательное решение зависит от грунта на участке.' },
  { id: 'insulation', title: 'Утепление', icon: LuLayers, note: 'Выберите толщину утепления. На иллюстрации — материал конструкции.' },
  { id: 'roof', title: 'Кровля', icon: LuHouse, note: 'Сравните материалы: покрытие изменится на изображении дома.' },
  { id: 'facade', title: 'Фасад', icon: LuPaintbrush, note: 'Натуральное дерево или окрашенная отделка — посмотрите, что ближе вам.' },
  { id: 'terrace', title: 'Терраса', icon: LuFence, note: 'Выберите дом с террасой или без неё. Изображение и расчёт обновятся автоматически.' },
]
type FormKind = 'constructor' | 'constructor-mortgage'

export function HouseConstructor() {
  const [input, setInput] = useState<ConstructorInput>(defaultConstructorInput)
  const [active, setActive] = useState<StepId>('size')
  const stepIndex = sections.findIndex((item) => item.id === active)

  const goTo = (index: number) => {
    const next = sections[Math.max(0, Math.min(index, sections.length - 1))]
    setActive(next.id as StepId)
    track('constructor_step', { step: next.id })
  }
  const [form, setForm] = useState<FormKind | null>(null)
  const [mortgage, setMortgage] = useState<MortgageInput>({ program: 'family', downPaymentPct: cfg.mortgage.downPaymentDefaultPct, termYears: cfg.mortgage.defaultTermYears })
  const mortgageRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const estimate = useMemo(() => estimateHouse(input), [input])
  const isCustom = input.size === 'custom'
  const size = cfg.sizes.find((item) => item.id === input.size) ?? cfg.sizes[0]
  const patch = (next: Partial<ConstructorInput>) => setInput((prev) => ({ ...prev, ...next }))
  const priceFor = (perM2: number) => isCustom ? 'По запросу' : perM2 ? '+ ' + formatPrice(perM2 * size.area) : 'Включено'
  const openForm = (kind: FormKind) => {
    setForm(kind)
    track(kind === 'constructor' ? 'constructor_save' : 'constructor_mortgage', { size: input.size, total: estimate.total })
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  function choices(id: StepId) {
    switch (id) {
      case 'size': return <OptionCards label="Размер дома" variant="row" value={input.size} onChange={(size) => patch({ size })} options={cfg.sizes.map((item) => ({ id: item.id, label: item.id === 'custom' ? 'Свой размер' : item.label + ' м', note: item.id === 'custom' ? 'По запросу' : item.area + ' м²' }))} />
      case 'foundation': return <OptionCards label="Фундамент" value={input.foundation} onChange={(foundation) => patch({ foundation })} options={cfg.foundations.map((item) => ({ id: item.id, label: item.id === 'screw' ? 'Винтовые сваи' : 'Железобетонные', price: isCustom ? 'По запросу' : formatPrice(size.piles * item.pricePerPile), preview: <OptionPreview kind="foundation" value={item.id} /> }))} />
      case 'insulation': return <OptionCards label="Утепление" value={input.insulation} onChange={(insulation) => patch({ insulation })} options={cfg.insulation.map((item) => ({ id: item.id, label: item.label, price: priceFor(item.pricePerM2), preview: <OptionPreview kind="insulation" value={item.id} /> }))} />
      case 'roof': return <OptionCards label="Кровля" value={input.roof} onChange={(roof) => patch({ roof })} options={cfg.roofs.map((item) => ({ id: item.id, label: item.label, price: priceFor(item.pricePerM2), preview: <OptionPreview kind="roof" value={item.id} /> }))} />
      case 'facade': return <OptionCards label="Фасад" value={input.facade} onChange={(facade) => patch({ facade })} options={cfg.facades.map((item) => ({ id: item.id, label: item.id === 'painted' ? 'Брус с покраской' : item.label, price: priceFor(item.pricePerM2), preview: <OptionPreview kind="facade" value={item.id} /> }))} />
      case 'terrace': return <OptionCards<'yes' | 'no'> label="Терраса" value={input.terrace ? 'yes' : 'no'} onChange={(value) => patch({ terrace: value === 'yes' })} options={[
        { id: 'yes', label: 'С террасой', price: isCustom ? 'По запросу' : 'Включено', preview: <OptionPreview kind="terrace" value="yes" /> },
        { id: 'no', label: 'Без террасы', price: isCustom ? 'По запросу' : '− ' + formatPrice(cfg.terrace.removeDiscount), preview: <OptionPreview kind="terrace" value="no" /> },
      ]} />
      case 'delivery': return <div className="constructor-delivery"><Stepper label="От производства в Янино" unit="км" min={0} max={cfg.delivery.maxKm} step={5} value={input.distanceKm} onChange={(distanceKm) => patch({ distanceKm })} /><p>{input.distanceKm ? 'Доставка: ' + (isCustom ? 'по запросу' : formatPrice(estimate.delivery)) : 'Укажите расстояние до участка'}</p></div>
    }
  }

  return <>
    <div className="shell"><section id="constructor" className="constructor-studio photo-studio compact-studio">
      <nav className="constructor-tabs" aria-label="Настройки дома">
        {sections.map(({ id, title, icon: Icon }, index) => <button key={id} type="button" aria-pressed={active === id} onClick={() => goTo(index)}><Icon aria-hidden/><span>{title}</span></button>)}
      </nav>
      <div className="constructor-workspace">
        <div className="constructor-options">
          <div className="constructor-wizard-heading"><span>Ваша комплектация</span><span>{String(stepIndex + 1).padStart(2, '0')} / 06</span></div>
          <div key={active} className="constructor-wizard-body" data-step={active}>
            <h2>{sections[stepIndex].title}</h2>
            <p className="constructor-selection-note">{sections[stepIndex].note}</p>
            {choices(active)}
            {active === 'size' ? <p className="constructor-inline-note">Габариты по внешнему контуру, включая террасу. Изображение показывает материалы; точная геометрия — в проекте.</p> : null}
          </div>
          <div className="constructor-wizard-nav">
            <Button variant="outline" size="sm" disabled={stepIndex === 0} onClick={() => goTo(stepIndex - 1)}>Назад</Button>
            {stepIndex < sections.length - 1 ? <Button size="sm" arrow onClick={() => goTo(stepIndex + 1)}>Далее</Button> : <Button size="sm" arrow onClick={() => openForm('constructor')}>К расчёту</Button>}
          </div>
          <details className="constructor-delivery-extra"><summary><LuTruck aria-hidden/><span>Рассчитать доставку</span><LuChevronDown aria-hidden/></summary>{choices('delivery')}</details>
          <PriceSummary input={input} estimate={estimate} mortgageInput={mortgage} onSave={() => openForm('constructor')} onMortgage={() => mortgageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="constructor-price" />
        </div>
        <div className="constructor-scene-slot">
          <PhotoHouse input={input} />

        </div>
      </div>
    </section></div>
    <section className="constructor-details shell">
      <MortgagePanel ref={mortgageRef} price={estimate.total} disabled={isCustom} value={mortgage} onChange={setMortgage} onRequest={() => openForm('constructor-mortgage')} />
      {form ? <div ref={formRef} className="constructor-lead scroll-mt-24">
        <div><h2>{form === 'constructor' ? 'Сохраним ваш расчёт' : 'Подберём ипотеку на ваш дом'}</h2><p>{isCustom ? 'Укажите размеры и пожелания в комментарии.' : describeInput(input, estimate)}</p></div>
        <LeadForm formType={form} submitLabel={form === 'constructor' ? 'Получить расчёт' : 'Подобрать ипотеку'} calculationId={describeInput(input, estimate)} area={isCustom ? undefined : estimate.area} withComment={isCustom} />
        <Button variant="outline" size="sm" onClick={() => setForm(null)}>Закрыть</Button>
      </div> : null}
    </section>
  </>
}


