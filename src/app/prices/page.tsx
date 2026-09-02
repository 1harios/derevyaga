import type { Metadata } from 'next'
import { FinalCta } from '@/components/home/FinalCta'
import { PageHero } from '@/components/layout/PageHero'
import { Button } from '@/components/ui/Button'
import { Section, SectionHeader } from '@/components/ui/Section'
import { complectations } from '@/content/complectations'
import { calculate, optionLabels, type CalcInput } from '@/lib/pricing/engine'
import { pricing } from '@/lib/pricing/pricing.config'
import { formatNumber, formatPrice, formatPriceShort, pluralized } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Цены на каркасные дома: ставки за м² и примеры смет',
  description: `Каркасный дом от ${formatNumber(pricing.basePerM2.frame)} ₽/м². Из чего складывается цена, какие коэффициенты её двигают и примеры смет с графиком платежей. Смета фиксируется в договоре.`,
  alternates: { canonical: '/prices' },
}

/** Проценты считаем из рабочего файла цен: правки менеджера попадают сюда сами */
const pct = (k: number) => `${k > 1 ? '+' : '−'}${Math.round(Math.abs(k - 1) * 100)}%`

const factors = [
  {
    title: 'Этажность',
    note: 'У двух этажей общий фундамент и кровля, поэтому м² дешевле',
    rows: [
      { name: optionLabels.floors['1'], value: 'база' },
      { name: optionLabels.floors['1.5'], value: pct(pricing.floors['1.5']) },
      { name: optionLabels.floors['2'], value: pct(pricing.floors['2']) },
    ],
  },
  {
    title: 'Фундамент',
    note: 'Свайно-винтовой подходит большинству участков Ленобласти',
    rows: [
      { name: optionLabels.foundation.piles, value: 'база' },
      { name: optionLabels.foundation.strip, value: pct(pricing.foundation.strip) },
      { name: optionLabels.foundation.slab, value: pct(pricing.foundation.slab) },
    ],
  },
  {
    title: 'Кровля',
    note: 'Считается от площади кровли, в ставке — материал и работа',
    rows: [
      { name: optionLabels.roof.metal, value: 'база' },
      { name: optionLabels.roof.soft, value: pct(pricing.roof.soft) },
      { name: optionLabels.roof.seam, value: pct(pricing.roof.seam) },
    ],
  },
  {
    title: 'Фасад',
    note: 'Во всех вариантах — вентзазор и покраска в два слоя',
    rows: [
      { name: optionLabels.facade.imitation, value: 'база' },
      { name: optionLabels.facade.planken, value: pct(pricing.facade.planken) },
      { name: optionLabels.facade.plaster, value: pct(pricing.facade.plaster) },
    ],
  },
  {
    title: 'Утепление стен',
    note: `Стандарт для круглогодичной жизни — ${optionLabels.insulation['200']}`,
    rows: [
      { name: optionLabels.insulation['150'], value: pct(pricing.insulation['150']) },
      { name: optionLabels.insulation['200'], value: 'база' },
      { name: optionLabels.insulation['250'], value: pct(pricing.insulation['250']) },
    ],
  },
  {
    title: 'Инженерия и остальное',
    note: 'Считаются надбавкой, а не коэффициентом',
    rows: [
      { name: 'Инженерия базовая / полная', value: `${formatNumber(pricing.engineeringPerM2.basic)} / ${formatNumber(pricing.engineeringPerM2.full)} ₽ за м²` },
      { name: 'Терраса', value: `${formatNumber(pricing.terracePerM2)} ₽ за м²` },
      { name: `Логистика дальше ${pricing.distance.freeKm} км от КАД`, value: `${formatNumber(pricing.distance.pricePerKm)} ₽ за км` },
    ],
  },
]

/** Примеры смет: три типовых сценария, считаются тем же движком, что и калькулятор */
const examples: { label: string; description: string; input: CalcInput }[] = [
  {
    label: 'Дача на выходные',
    description: '78 м², один этаж, комплектация «Каркас» — контур закрыт, отделка своими силами',
    input: {
      area: 78, floors: '1', foundation: 'piles', completeness: 'frame', roof: 'metal',
      facade: 'imitation', insulation: '200', windows: 'standard', engineering: 'none',
      terraceArea: 8, distanceKm: 25,
    },
  },
  {
    label: 'Дом под чистовую',
    description: '118 м² с мансардой, коммуникации разведены — остаются обои и полы',
    input: {
      area: 118, floors: '1.5', foundation: 'piles', completeness: 'prefinish', roof: 'metal',
      facade: 'imitation', insulation: '200', windows: 'standard', engineering: 'basic',
      terraceArea: 9, distanceKm: 60,
    },
  },
  {
    label: 'Семейный под ключ',
    description: '132 м², два этажа, заезжаете с мебелью — всё принято по акту',
    input: {
      area: 132, floors: '2', foundation: 'piles', completeness: 'turnkey', roof: 'metal',
      facade: 'imitation', insulation: '200', windows: 'standard', engineering: 'basic',
      terraceArea: 18, distanceKm: 40,
    },
  },
]

export default function PricesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Цены' }]}
        title="Из чего складывается цена дома"
        lead={
          <>
            Никаких «цена по запросу»: ниже ставки за м², коэффициенты, которые двигают
            цену, и три примера смет. <strong>Все цифры — из рабочего файла цен</strong>,
            по которому считает и калькулятор, и наш сметчик.
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          {complectations.map((item) => (
            <span key={item.id} className="chip bg-surface">
              {item.name} — от {formatNumber(item.pricePerM2)} ₽/м²
            </span>
          ))}
        </div>
      </PageHero>

      {/* Формула: как из ставки получается итог */}
      <Section>
        <div className="panel">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-12">
            <div>
              <p className="eyebrow mb-3">Формула</p>
              <h2>Ставка × коэффициенты + надбавки</h2>
              <p className="lead mt-4">
                База — цена за м² выбранной комплектации. Дальше её двигают коэффициенты
                участка и материалов, а инженерия, терраса и логистика добавляются отдельными
                строками. Итог показываем диапазоном ±{Math.round(pricing.spread * 100)}%
                до замера.
              </p>
              <div className="mt-6">
                <Button href="/calculator" arrow>
                  Посчитать свой дом
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {factors.map((factor) => (
                <div key={factor.title} className="card rounded-xl p-5 md:p-6">
                  <h3 className="text-[16px]">{factor.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-[1.5] muted">{factor.note}</p>
                  <dl className="mt-4 space-y-2 border-t border-line pt-4 text-[14px]">
                    {factor.rows.map((row) => (
                      <div
                        key={row.name}
                        className="flex flex-col gap-0.5 min-[360px]:flex-row min-[360px]:items-baseline min-[360px]:justify-between min-[360px]:gap-4"
                      >
                        <dt className="muted">{row.name}</dt>
                        <dd className="tabular-nums min-[360px]:text-right">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Примеры смет, посчитанные движком */}
      <Section>
        <SectionHeader
          align="center"
          eyebrow="Примеры"
          title="Три сметы для ориентира"
          description="Посчитаны тем же движком, что и калькулятор. Ваша цифра будет другой — она зависит от площади, комплектации и участка."
        />

        <div className="grid gap-3 md:grid-cols-3">
          {examples.map((example) => {
            const result = calculate(example.input)
            return (
              <article key={example.label} className="card flex flex-col rounded-xl p-6 md:p-7">
                <h3 className="text-[18px]">{example.label}</h3>
                <p className="mt-2 text-[14px] leading-[1.55] muted">{example.description}</p>

                <div className="mt-5 border-t border-line pt-5">
                  <div className="text-[13px] muted">Диапазон до замера</div>
                  <div className="num mt-1 text-[clamp(1.4rem,1.2rem+0.8vw,1.8rem)]">
                    {formatPriceShort(result.priceFrom)} — {formatPriceShort(result.priceTo)}
                  </div>
                </div>

                <dl className="mt-4 space-y-2 text-[14px]">
                  <div className="flex justify-between gap-4">
                    <dt className="muted">За м²</dt>
                    <dd className="tabular-nums">{formatNumber(result.pricePerM2)} ₽</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="muted">Срок стройки</dt>
                    <dd className="tabular-nums">{pluralized(result.days, ['день', 'дня', 'дней'])}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="muted">Первый платёж</dt>
                    <dd className="tabular-nums">{formatPrice(result.payments[0].amount)}</dd>
                  </div>
                </dl>

                <p className="mt-auto pt-5 text-[13px] leading-[1.5] muted">
                  {optionLabels.completeness[example.input.completeness]} ·{' '}
                  {optionLabels.floors[example.input.floors].toLowerCase()} ·{' '}
                  {example.input.distanceKm} км от КАД
                </p>
              </article>
            )
          })}
        </div>
      </Section>

      {/* График платежей: деньги привязаны к этапам, а не к календарю */}
      <Section>
        <div className="panel panel--dark on-dark">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-12">
            <div>
              <p className="eyebrow mb-3">
                <span aria-hidden className="size-1.5 rounded-full bg-white/60" />
                Платежи
              </p>
              <h2>Платите за принятые этапы, не вперёд</h2>
              <p className="lead mt-4">
                Аванс — только {Math.round(pricing.paymentSchedule[0].share * 100)}% на проект
                и закупку. Дальше каждый платёж привязан к акту приёмки этапа:
                не приняли работу — не платите.
              </p>
            </div>

            <div>
              {/* Полоса долей: видно, что деньги размазаны по стройке */}
              <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full">
                {pricing.paymentSchedule.map((item, index) => (
                  <span
                    key={item.stage}
                    title={`${item.stage}: ${Math.round(item.share * 100)}%`}
                    className={index % 2 === 0 ? 'h-full bg-white/85' : 'h-full bg-white/45'}
                    style={{ width: `${item.share * 100}%` }}
                  />
                ))}
              </div>

              <ol className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {pricing.paymentSchedule.map((item, index) => (
                  <li key={item.stage} className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3 text-[15px]">
                    <span className="flex items-baseline gap-3">
                      <span className="num w-5 shrink-0 text-[13px] text-white/50">{index + 1}</span>
                      {item.stage}
                    </span>
                    <span className="num shrink-0">{Math.round(item.share * 100)}%</span>
                  </li>
                ))}
              </ol>

              <p className="muted mt-6 text-[14px] leading-[1.6]">
                Ипотека и материнский капитал ложатся в этот же график — банк платит
                за вас по тем же этапам.{' '}
                <a href="/mortgage" className="link-underline text-white">
                  Подробнее про ипотеку и рассрочку
                </a>
              </p>
            </div>
          </div>
        </div>
      </Section>

      <FinalCta
        formType="prices"
        title="Точная смета — бесплатно и за 2 дня"
        lead={
          <>
            Диапазоны выше — ориентир. Чтобы получить цифру, за которую мы отвечаем
            договором, нужен бесплатный замер участка. <strong>Смета остаётся у вас</strong>,
            даже если строить будете с другими.
          </>
        }
      />
    </>
  )
}
