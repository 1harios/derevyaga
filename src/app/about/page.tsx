import type { Metadata } from 'next'
import Image from 'next/image'
import { FinalCta } from '@/components/home/FinalCta'
import { PageHero } from '@/components/layout/PageHero'
import { Button } from '@/components/ui/Button'
import { Section, SectionHeader } from '@/components/ui/Section'
import { company, promises, stats } from '@/content/company'

export const metadata: Metadata = {
  title: 'О компании: своя бригада, свой инструмент, 15 лет на рынке',
  description: `«Деревяга» строит каркасные дома в Санкт-Петербурге и Ленобласти с 2011 года: ${promises.objectsBuilt}+ сданных домов, штатные бригады, фиксированная смета и личный кабинет со стройкой онлайн.`,
  alternates: { canonical: '/about' },
}

/** Принципы, из-за которых заказчики нас выбирают — и пара неудобных следствий */
const principles = [
  {
    title: 'Строим штатными бригадами',
    text: 'Каркас, кровлю и фасад делают четыре постоянные бригады по 4–5 человек, у каждой свой прораб. Электрика и сантехника — подрядчики, с которыми работаем больше пяти лет; их работу принимаем сами и отвечаем за неё по гарантии.',
    consequence: 'Следствие: не берём больше объектов, чем тянут бригады. В сезон очередь на старт — 3–5 недель.',
  },
  {
    title: 'Свой инструмент и прицеп-мастерская',
    text: 'Пилы, нивелиры, пневмопистолеты и генераторы — собственный парк, а не аренда по объекту. На каждой стройке — прицеп-мастерская: инструмент под рукой, брус пилится под навесом, а не под дождём.',
    consequence: 'Следствие: не зависим от «инструмент уехал на другой объект» — частой причины простоев.',
  },
  {
    title: 'Смета фиксируется в договоре',
    text: 'Риск подорожания материалов берём на себя: закупаем основное сразу после аванса. Смета меняется только если вы сами меняете состав работ — допсоглашением, до начала работ.',
    consequence: 'Следствие: наша цена на встрече иногда выше «цены от» конкурентов. Зато она конечная.',
  },
  {
    title: 'Стройка видна в кабинете',
    text: 'Фотоотчёты каждые 7 дней и перед зашивкой скрытых работ, статусы этапов с план-фактом, документы и график платежей — в личном кабинете с первого дня договора.',
    consequence: 'Следствие: скрыть задержку не получится, поэтому о рисках предупреждаем заранее.',
  },
]

export default function AboutPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'О компании' }]}
        title="Строим сами, а не передаём подряд"
        lead={
          <>
            «Деревяга» строит каркасные дома в Петербурге и Ленобласти с 2011 года.
            Мы небольшая компания: <strong>четыре штатные бригады, свой инструмент</strong> и
            принцип «лучше меньше объектов, но каждый — в срок и по смете».
          </>
        }
      />

      {/* Цифры доверия — те же, что на главной, единый источник */}
      <Section compact>
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <li key={stat.label} className="card rounded-xl p-5 md:p-6">
              <div className="num text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)]">{stat.value}</div>
              <div className="mt-2 text-[14px] leading-snug">
                {stat.label}
                <span className="muted block text-[13px]">{stat.note}</span>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* Бригада и инструмент — фото как есть, без постановки */}
      <Section>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <figure className="card overflow-hidden rounded-xl p-2">
            <Image
              src="/photos/brigada.webp"
              alt="Бригада укладывает утеплитель в каркас стены"
              width={1400}
              height={933}
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="w-full rounded-lg object-cover"
            />
            <figcaption className="px-3 py-4 text-[14px] muted">
              Постоянный состав: четыре бригады по 4–5 человек, у каждой свой прораб.
              Состав вашей бригады виден в личном кабинете.
            </figcaption>
          </figure>

          <figure className="card flex flex-col overflow-hidden rounded-xl p-2">
            <Image
              src="/photos/park-instrumenta.webp"
              alt="Парк инструмента компании: пилы, нивелир, пневмопистолеты"
              width={1200}
              height={800}
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="w-full flex-1 rounded-lg object-cover"
            />
            <figcaption className="px-3 py-4 text-[14px] muted">
              Свой парк инструмента и прицеп-мастерская на каждом объекте.
            </figcaption>
          </figure>
        </div>
      </Section>

      {/* Принципы со следствиями: убеждают следствия, а не декларации */}
      <Section>
        <SectionHeader
          title="Четыре решения, которые всё определяют"
          description={
            <>
              У каждого принципа есть <strong>неудобное следствие</strong> — говорим
              и о нём, чтобы ожидания совпали с реальностью.
            </>
          }
        />
        <div className="grid gap-3 md:grid-cols-2">
          {principles.map((principle) => (
            <article key={principle.title} className="card flex flex-col rounded-xl p-6 md:p-7">
              <h3 className="text-[18px]">{principle.title}</h3>
              <p className="mt-3 text-[14.5px] leading-[1.6] muted">{principle.text}</p>
              <p className="mt-4 rounded-md bg-panel p-4 text-[13.5px] leading-[1.55]">
                {principle.consequence}
              </p>
            </article>
          ))}
        </div>
      </Section>

      {/* Юридическая сторона: с кем подписывается договор */}
      <Section>
        <div className="panel panel--dark on-dark">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-16">
            <div>
              <h2>Договор — с компанией, не с бригадиром</h2>
              <p className="lead mt-4">
                Договор подряда со сметой приложением, акты по этапам, все платежи —
                на расчётный счёт. Наличных «мимо кассы» нет: это защищает и вас,
                и гарантию, которая работает только при официальном договоре.
              </p>
              <div className="mt-7">
                <Button href="/guarantee" variant="light" arrow>
                  Про договор и гарантию
                </Button>
              </div>
            </div>

            <dl className="space-y-3 rounded-xl bg-white/6 p-6 text-[15px] md:p-7">
              <div className="flex justify-between gap-4">
                <dt className="muted">Компания</dt>
                <dd className="text-right">{company.legal.fullName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="muted">ИНН</dt>
                <dd className="tabular-nums">{company.legal.inn}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="muted">КПП</dt>
                <dd className="tabular-nums">{company.legal.kpp}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="muted">Офис</dt>
                <dd className="text-right">{company.address}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/12 pt-3">
                <dt className="muted">Работаем</dt>
                <dd>{company.workHours}</dd>
              </div>
            </dl>
          </div>
        </div>
      </Section>

      <FinalCta
        formType="about"
        title="Познакомимся на вашем участке"
        lead={
          <>
            Замерщик приедет бесплатно, посмотрит подъезд и грунты, ответит на вопросы
            про технологию. <strong>Смета после выезда — за {promises.estimateDays} рабочих дня</strong>,
            и она останется у вас в любом случае.
          </>
        }
      />
    </>
  )
}
