import type { Metadata } from 'next'
import { FinalCta } from '@/components/home/FinalCta'
import { PageHero } from '@/components/layout/PageHero'
import { Section, SectionHeader } from '@/components/ui/Section'
import { promises } from '@/content/company'

export const metadata: Metadata = {
  title: 'Гарантия и договор: что фиксируем и за что отвечаем',
  description: `Гарантия ${promises.guaranteeYears} лет на конструктив и 2 года на инженерию и отделку. Что покрывает гарантия, что фиксируется в договоре и как работает пеня 0,1% за день просрочки.`,
  alternates: { canonical: '/guarantee' },
}

/** ЗАМЕНИТЬ: формулировки проверить у юриста — они должны совпадать с договором */
const covered = [
  'Каркас: стойки, балки, узлы, крепёж',
  'Кровля: стропильная система, покрытие, герметичность',
  'Фасад: обшивка, покраска, вентзазор',
  'Герметичность тёплого контура: окна и двери по монтажу',
  'Фундамент: несущая способность свайного поля',
]

const notCovered = [
  'Последствия эксплуатации без отопления зимой',
  'Самовольные врезки в конструкцию и перепланировка без расчёта',
  'Естественный износ отделки: потёртости, сколы, выгорание',
  'Повреждения от третьих лиц и стихийных бедствий',
  'Оборудование по гарантии производителя: котёл, радиаторы, сантехника',
]

const contractPoints = [
  {
    title: 'Цена — фиксированная',
    text: 'Смета — приложение к договору, с составом работ построчно. Подорожание материалов — наш риск: закупаем основное сразу после аванса. Цена меняется только допсоглашением, если вы сами меняете состав работ.',
  },
  {
    title: 'Срок — с пенёй за просрочку',
    text: 'Дата сдачи стоит в договоре. За просрочку по нашей вине — пеня 0,1% от суммы этапа за каждый день. Срок сдвигается без пени только из-за погоды, запрещающей работы по технологии, или ваших правок после старта — и то, и другое фиксируется актом.',
  },
  {
    title: 'Платежи — по принятым этапам',
    text: `Аванс 10% на проект и закупку, дальше — только за принятые этапы. Не подписали акт — следующий платёж не начисляется. Полный график в личном кабинете с первого дня.`,
  },
  {
    title: 'Приёмка — по чек-листу из 74 пунктов',
    text: 'Принимаем дом вместе с вами по чек-листу: от геометрии стен до работы вентиляции. Замечания устраняем до подписания акта, а не «потом по гарантии». Чек-лист выдаём заранее — можно прийти со своим экспертом.',
  },
]

const claimSteps = [
  {
    number: 1,
    title: 'Заявка через кабинет или почту',
    text: 'Опишите проблему и приложите фото. Заявка получает номер — «потерять» её нельзя.',
  },
  {
    number: 2,
    // Срок реакции продублирован в FAQ — меняете здесь, поменяйте и там
    title: 'Реакция — 3 рабочих дня',
    text: 'Инженер связывается, при необходимости выезжает на объект и составляет акт с причиной и сроком устранения.',
  },
  {
    number: 3,
    title: 'Устранение и акт',
    text: 'Гарантийный случай устраняем за свой счёт в согласованный срок. Закрываем работы актом — он остаётся в кабинете.',
  },
]

export default function GuaranteePage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Гарантия и договор' }]}
        title="Что фиксируем на бумаге и за что отвечаем"
        lead={
          <>
            Гарантия работает, только когда написана в договоре конкретно: что покрыто,
            что нет и что будет, если мы не успеем в срок. Здесь всё это —{' '}
            <strong>теми же словами, что и в договоре</strong>.
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <span className="chip bg-surface">{promises.guaranteeYears} лет на конструктив</span>
          <span className="chip bg-surface">2 года на инженерию и отделку</span>
          <span className="chip bg-surface">пеня 0,1% за день просрочки</span>
        </div>
      </PageHero>

      {/* Что покрывает и что нет — рядом, а не мелким шрифтом */}
      <Section>
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="panel panel--dark on-dark">
            <p className="caption">Гарантия покрывает</p>
            <h2 className="mt-3 text-[clamp(1.3rem,1.1rem+0.8vw,1.75rem)]">
              {promises.guaranteeYears} лет — конструктив
            </h2>
            <ul className="mt-6 space-y-3.5 border-t border-white/12 pt-6 text-[15px]">
              {covered.map((item) => (
                <li key={item} className="flex gap-3.5">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-white/70" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="muted mt-6 text-[14px] leading-[1.6]">
              На инженерные системы и отделку — 2 года. На оборудование действует
              гарантия производителя, монтаж — наш.
            </p>
          </div>

          <div className="card rounded-2xl p-6 md:p-8">
            <p className="caption">Гарантия не покрывает</p>
            <h2 className="mt-3 text-[clamp(1.3rem,1.1rem+0.8vw,1.75rem)]">
              Честный список исключений
            </h2>
            <ul className="mt-6 space-y-3.5 border-t border-line pt-6 text-[15px] muted">
              {notCovered.map((item) => (
                <li key={item} className="flex gap-3.5">
                  <span aria-hidden className="mt-3 h-px w-3.5 shrink-0 bg-ink-faint" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[14px] leading-[1.6] muted">
              Исключения стандартные для отрасли — мы их не прячем в сноски. Если
              сомневаетесь, покрыт ли случай, — напишите, ответим до подписания.
            </p>
          </div>
        </div>
      </Section>

      {/* Договор: четыре пункта, которые решают всё */}
      <Section>
        <SectionHeader
          eyebrow="Договор"
          title="Четыре пункта, которые стоит проверять у любого подрядчика"
          description={
            <>
              Сравнивайте не обещания, а формулировки. Вот <strong>наши</strong> — и то,
              почему они написаны именно так.
            </>
          }
        />
        <div className="grid gap-3 md:grid-cols-2">
          {contractPoints.map((point) => (
            <article key={point.title} className="card rounded-xl p-6 md:p-7">
              <h3 className="text-[18px]">{point.title}</h3>
              <p className="mt-3 text-[14.5px] leading-[1.65] muted">{point.text}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* Как подать гарантийную заявку */}
      <Section>
        <div className="panel">
          <div className="mb-8 max-w-2xl">
            <p className="eyebrow mb-3">Гарантийный случай</p>
            <h2>Как это работает после сдачи</h2>
          </div>
          <ol className="grid gap-3 md:grid-cols-3">
            {claimSteps.map((step) => (
              <li key={step.number} className="card flex gap-5 rounded-xl p-6">
                <span
                  aria-hidden
                  className="num flex size-12 shrink-0 items-center justify-center rounded-full bg-panel text-[18px]"
                >
                  {step.number}
                </span>
                <div>
                  <h3 className="text-[16px]">{step.title}</h3>
                  <p className="mt-2 text-[14px] leading-[1.55] muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-3xl text-[14px] leading-[1.6] muted">
            Фото скрытых работ, сделанные до зашивки, хранятся в вашем кабинете навсегда —
            при спорной ситуации не придётся вскрывать стены, чтобы понять, кто прав.
          </p>
        </div>
      </Section>

      <FinalCta
        formType="guarantee"
        title="Пришлём шаблон договора до встречи"
        lead={
          <>
            Оставьте телефон — отправим <strong>шаблон договора и пример сметы</strong>,
            чтобы вы спокойно прочитали их дома или показали юристу. Вопросы по пунктам
            разберём на встрече.
          </>
        }
      />
    </>
  )
}
