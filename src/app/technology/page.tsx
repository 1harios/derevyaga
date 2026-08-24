import type { Metadata } from 'next'
import Image from 'next/image'
import { FinalCta } from '@/components/home/FinalCta'
import { WallDiagram } from '@/components/home/WallDiagram'
import { PageHero } from '@/components/layout/PageHero'
import { Button } from '@/components/ui/Button'
import { Section, SectionHeader } from '@/components/ui/Section'
import { promises } from '@/content/company'
import { techCards } from '@/content/technology'

export const metadata: Metadata = {
  title: 'Технология: как устроен наш каркасный дом',
  description:
    'Брус камерной сушки до 18%, утепление 200 мм, вентзазор 45 мм и проклеенная пароизоляция. Разрез стены по слоям, узлы и контроль качества — без «фирменных секретов».',
  alternates: { canonical: '/technology' },
}

/** Предметные образцы: те же, что показываем на встречах в офисе */
const samples = [
  {
    photo: '/photos/tech-uzel.webp',
    alt: 'Образец углового узла каркаса: стойка, балка и раскос на стальном крепеже',
    title: 'Узел в сборе',
    text: 'Углы, примыкания перекрытий и опоры кровли собираем по типовым узлам на перфорированный крепёж и винты. На встрече даём покрутить образец в руках — видно, что держит нагрузку металл, а не «как получится» забитый гвоздь.',
  },
  {
    photo: '/photos/tech-uteplenie.webp',
    alt: 'Образец стены в разрезе: стойки, минеральный утеплитель, мембрана и обшивка',
    title: 'Стена в разрезе',
    text: 'Каменная вата стоит враспор с запасом 10 мм — между утеплителем и стойкой нет щели, через которую уходит тепло. Снаружи ветрозащита и вентзазор, изнутри пароизоляция с проклейкой каждого стыка.',
  },
  {
    photo: '/photos/tech-bez-usadki.webp',
    alt: 'Стопка сухого строганого бруса с влагомером',
    title: 'Брус под влагомером',
    text: 'Каждую партию бруса проверяем влагомером при приёмке: больше 18% — партия едет обратно поставщику. Сухой брус не ведёт после первого отопительного сезона, поэтому не расходятся стыки и не трещит обшивка.',
  },
]

/** Что получает заказчик как доказательство, а не обещание */
const proofs = [
  {
    title: 'Теплотехнический расчёт к договору',
    text: 'Сопротивление теплопередаче стен, кровли и пола считаем под климат Ленинградской области и прикладываем к договору. Расчёт можно отдать на проверку независимому эксперту.',
  },
  {
    title: 'Фото скрытых работ до зашивки',
    text: 'Утепление, пароизоляция, разводка инженерии — всё фотографируется до того, как закроется отделкой. Снимки остаются в личном кабинете навсегда.',
  },
  {
    title: `Гарантия ${promises.guaranteeYears} лет на конструктив`,
    text: 'Каркас, кровля, фасад, узлы и герметичность контура. Гарантия работает, потому что мы уверены в узлах — а не потому что напечатана в буклете.',
  },
]

export default function TechnologyPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Технология' }]}
        title="Как устроен наш каркасный дом"
        lead={
          <>
            Каркасник получается холодным или тёплым не из-за технологии, а из-за
            исполнения. Здесь — <strong>из чего собран наш дом, слой за слоем</strong>,
            и как мы доказываем качество, а не просим верить на слово.
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <span className="chip bg-surface">брус камерной сушки до 18%</span>
          <span className="chip bg-surface">утепление {promises.insulationMm} мм</span>
          <span className="chip bg-surface">вентзазор 45 мм</span>
          <span className="chip bg-surface">пароизоляция с проклейкой стыков</span>
        </div>
      </PageHero>

      {/* Разрез стены: схема + пояснение, почему слои именно такие */}
      <Section>
        <div className="panel">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-12">
            <div>
              <p className="eyebrow mb-3">Разрез стены</p>
              <h2>Семь слоёв, у каждого своя работа</h2>
              <p className="lead mt-4">
                Снаружи внутрь: фасад защищает от осадков, вентзазор выводит влагу,
                мембрана держит ветер, утеплитель — тепло, пароизоляция не пускает
                пар из дома в стену, обрешётка прячет коммуникации без штробления.
              </p>
              <p className="mt-4 text-[15px] leading-[1.65] muted">
                Чаще всего экономят на двух вещах: проклейке пароизоляции и вентзазоре.
                Снаружи этого не видно, а через пару лет в утеплителе появляется конденсат —
                и стена перестаёт держать тепло. Поэтому оба пункта у нас в каждом доме,
                без «эконом-вариантов», и оба фотографируются до зашивки.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <Button href="#final-form" arrow>
                  Получить пример расчёта
                </Button>
                <Button href="/guarantee" variant="outline">
                  Что покрывает гарантия
                </Button>
              </div>
            </div>

            <WallDiagram />
          </div>
        </div>
      </Section>

      {/* Параметры узлов — цифры, за которые отвечаем */}
      <Section>
        <SectionHeader
          eyebrow="Параметры"
          title="Цифры, за которые отвечаем договором"
          description={
            <>
              Не «строим на совесть», а конкретные значения. Если подрядчик не может
              назвать свои — <strong>это повод спросить, почему</strong>.
            </>
          }
        />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {techCards.map((card) => (
            <li key={card.title} className="card flex flex-col rounded-xl p-6">
              <div className="num text-[clamp(1.5rem,1.25rem+1vw,2rem)] text-brand-deep">
                {card.value}
              </div>
              <h3 className="mt-3 text-[16px]">{card.title}</h3>
              <p className="mt-2 text-[14px] leading-[1.6] muted">{card.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Предметные образцы: фото на белом, как на встрече в офисе */}
      <Section>
        <SectionHeader
          eyebrow="Образцы"
          title="То, что даём потрогать на встрече"
          description="Фрагменты реальных конструкций, а не рендеры. Приезжайте в офис — соберём и разберём узел при вас."
        />
        <div className="grid gap-3 md:grid-cols-3">
          {samples.map((sample) => (
            <figure key={sample.title} className="card overflow-hidden rounded-xl">
              <div className="flex h-56 items-center justify-center bg-white p-6">
                <Image
                  src={sample.photo}
                  alt={sample.alt}
                  width={800}
                  height={800}
                  sizes="(min-width: 768px) 30vw, 90vw"
                  className="max-h-full w-auto object-contain"
                />
              </div>
              <figcaption className="border-t border-line p-5 md:p-6">
                <h3 className="text-[16px]">{sample.title}</h3>
                <p className="mt-2 text-[14px] leading-[1.6] muted">{sample.text}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* Доказательства вместо обещаний */}
      <Section>
        <div className="panel panel--dark on-dark">
          <div className="mb-8 max-w-2xl">
            <p className="eyebrow mb-3">
              <span aria-hidden className="size-1.5 rounded-full bg-white/60" />
              Контроль
            </p>
            <h2>Качество, которое можно проверить</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {proofs.map((proof) => (
              <div key={proof.title} className="rounded-xl bg-white/6 p-6">
                <h3 className="text-[16px]">{proof.title}</h3>
                <p className="muted mt-2.5 text-[14px] leading-[1.6]">{proof.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <FinalCta
        formType="technology"
        title="Пришлём пример теплотехнического расчёта"
        lead={
          <>
            Оставьте телефон — отправим пример расчёта и сметы, чтобы вы видели,
            <strong> как выглядят наши документы до подписания</strong>. Заодно ответим
            на вопросы по технологии.
          </>
        }
      />
    </>
  )
}
