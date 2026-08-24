import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { promises } from '@/content/company'

/**
 * «Шесть шагов к вашему дому» — по референсу заказчика, в стилистике сайта:
 * слева заголовок с двухцветной подписью, справа полоса шагов с фирменными
 * кружками во мхе и линией-таймлайном между ними (на широких экранах).
 * Ниже — фотобаннер с бригадой, чипом-цифрой и «монеткой»-кнопкой.
 * Это короткая карта пути клиента; подробный график из восьми этапов
 * с платежами живёт на страницах проектов и в договоре.
 */
const steps = [
  {
    number: '01',
    title: 'Заявка',
    text: 'Оставляете телефон на сайте или звоните нам',
    icon: (
      <svg viewBox="0 0 20 20" aria-hidden className="size-5">
        <path
          d="M4.6 3h2.8l1.4 3.6-1.9 1.5a11.6 11.6 0 0 0 5 5l1.5-1.9L17 12.6v2.8c0 .8-.6 1.4-1.4 1.3C8.2 16.1 3.9 11.8 3.3 4.4 3.2 3.6 3.8 3 4.6 3Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Замер',
    text: 'Бесплатно выезжаем на участок: грунт, подъезд, уклон',
    icon: (
      <svg viewBox="0 0 20 20" aria-hidden className="size-5">
        <path
          d="M3 12.4 12.4 3l4.6 4.6L7.6 17 3 12.4Z M6.6 8.8l1.5 1.5 M9.2 6.2l1.5 1.5 M11.8 3.6l1.5 1.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Договор',
    text: `Смета за ${promises.estimateDays} дня, цена и срок фиксируются`,
    icon: (
      <svg viewBox="0 0 20 20" aria-hidden className="size-5">
        <path
          d="M5 2.6h7.2L15.4 6v11.4H5V2.6Z M12 2.6V6h3.4 M7.4 11.6l1.8 1.8 3.4-3.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Стройка',
    text: `Штатная бригада, фотоотчёты каждые ${promises.photoReportEveryDays} дней`,
    icon: (
      <svg viewBox="0 0 20 20" aria-hidden className="size-5">
        <path
          d="M3.4 9.4 10 3.8l6.6 5.6 M5.2 8.2V16h9.6V8.2 M5.2 12.2h9.6 M10 5.4V16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    number: '05',
    title: 'Приёмка',
    text: 'Проходим чек-лист из 74 пунктов вместе с вами',
    icon: (
      <svg viewBox="0 0 20 20" aria-hidden className="size-5">
        <path
          d="M5 4.6h10v12.8H5V4.6Z M7.2 4.6V3h5.6v1.6 M7.4 10.6l1.7 1.7 3.2-3.4 M7.4 14.4h5.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    number: '06',
    title: 'Гарантия',
    text: `${promises.guaranteeYears} лет на конструктив, кабинет остаётся с вами`,
    icon: (
      <svg viewBox="0 0 20 20" aria-hidden className="size-5">
        <path
          d="M10 2.2 16.5 4.8v4.4c0 4-2.6 6.9-6.5 8.4-3.9-1.5-6.5-4.4-6.5-8.4V4.8L10 2.2Z M7.2 9.8l2 2 3.6-3.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
]

export function BuildStepsBlock() {
  return (
    <Section id="steps">
      {/* Заголовок в фирменной манере: тема слева, двухцветная подпись справа */}
      <div className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow mb-3" data-reveal>
            Как мы строим
          </p>
          <h2 data-reveal style={{ '--reveal-delay': '80ms' } as React.CSSProperties}>
            Шесть шагов
            <br />
            к вашему дому
          </h2>
        </div>
        <p
          className="max-w-xs text-[15px] leading-[1.5]"
          data-reveal
          style={{ '--reveal-delay': '140ms' } as React.CSSProperties}
        >
          От заявки до ключей — один договор.{' '}
          <span className="muted">
            Подробный график из восьми этапов с датами и платежами будет в договоре
            и личном кабинете.
          </span>
        </p>
      </div>

      <ol className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 xl:grid-cols-6">
        {steps.map((step, index) => (
          <li
            key={step.number}
            data-reveal
            style={{ '--reveal-delay': `${index * 80}ms` } as React.CSSProperties}
            className="relative"
          >
            {/* Кружок в фирменном мхе; линия-таймлайн тянется к следующему
                шагу — только на xl, где все шесть стоят в один ряд */}
            <div className="relative">
              <span className="grid size-12 place-items-center rounded-full bg-brand-tint text-brand-deep">
                {step.icon}
              </span>
              {index < steps.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute left-[60px] right-[-12px] top-6 hidden h-px bg-line xl:block"
                />
              ) : null}
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="num text-[13px] text-ink-faint">{step.number}</span>
              <h3 className="text-[16px]">{step.title}</h3>
            </div>
            <p className="mt-1.5 text-[13px] leading-[1.5] muted">{step.text}</p>
          </li>
        ))}
      </ol>

      {/* Фотобаннер: бригада за работой, чип с цифрой и переход к стройкам */}
      <div className="relative mt-9 overflow-hidden rounded-2xl md:mt-12" data-reveal="zoom">
        <Image
          src="/photos/brigada.webp"
          alt="Бригада собирает каркас дома"
          width={1400}
          height={933}
          sizes="(min-width: 1024px) 92vw, 100vw"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Затемнение к низу и влево — текст и чип читаются на любом кадре */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-black/15"
        />

        <div className="relative flex min-h-[300px] flex-col justify-between gap-8 p-6 text-white md:min-h-[340px] md:p-9">
          <span className="chip chip--glass self-start">
            {promises.objectsBuilt}+ домов с 2011 года
          </span>

          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-md">
              <h3 className="text-[clamp(1.3rem,1.1rem+0.9vw,1.9rem)]">
                Своя бригада
                <br />
                и свой инструмент
              </h3>
              <p className="mt-2.5 text-[15px] leading-[1.55] text-white/80">
                Контроль каждого этапа — от сметы до передачи ключей.
              </p>
            </div>
            <Button href="/objects" variant="light" arrow className="shrink-0">
              Посмотреть объекты
            </Button>
          </div>
        </div>
      </div>
    </Section>
  )
}
