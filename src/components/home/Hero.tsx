import Image from 'next/image'
import { HeaderInline } from '@/components/layout/HeaderInline'
import { Button } from '@/components/ui/Button'
import { CountUp } from '@/components/ui/CountUp'
import { company } from '@/content/company'
import { telHref } from '@/lib/utils'

/** ЗАМЕНИТЬ: цифры доверия — заглушки из брифа.
    Как в референсе: у цифры только символ (~ или +), единицы — в подписи.
    В кружках — простые линейные иконки в фирменном мхе */
const heroStats = [
  {
    value: 94,
    suffix: '~',
    label: 'дня средний срок стройки под ключ',
    icon: (
      <svg viewBox="0 0 20 20" aria-hidden className="size-5">
        <path
          d="M10 17.3a6.6 6.6 0 1 0 0-13.2 6.6 6.6 0 0 0 0 13.2Z M10 7.2v3.5l2.4 1.5 M8.2 2h3.6 M15.6 5.2l1.1 1.1"
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
    value: 5,
    suffix: '+',
    label: 'лет гарантии на конструктив по договору',
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
  {
    value: 218,
    suffix: '+',
    label: 'домов сдано с 2011 года',
    icon: (
      <svg viewBox="0 0 20 20" aria-hidden className="size-5">
        <path
          d="M3.2 9.4 10 3.4l6.8 6M5 8v7.4c0 .7.5 1.2 1.2 1.2h7.6c.7 0 1.2-.5 1.2-1.2V8M7.9 12.3l1.6 1.6 2.9-3"
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

export function Hero() {
  return (
    <section className="pt-1">
      <div className="shell">
        {/* Первый экран занимает весь вьюпорт: панель и фото тянутся вниз,
            контент внутри распределяется justify-between.
            Ниже lg сетка складывается в столбик: панель с текстом и кнопками,
            сразу фото, затем компактные карточки цифр */}
        <div className="grid gap-3 lg:min-h-[calc(100svh-16px)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-4">
          {/* Верхний отступ панели равен отступу пилюль на фото (24px):
              шапка и пилюли встают на одну линию. Три яруса — шапка,
              текст с кнопками, карточки цифр — распределяются по высоте
              панели равномерно, как в референсе */}
          <div className="panel panel--sheen flex flex-col justify-between gap-8 pt-6">
            {/* Шапка живёт внутри панели, как в референсе */}
            <HeaderInline />

            <div className="lg:my-auto">
              <p className="eyebrow mb-4" data-reveal>
                <svg viewBox="0 0 16 16" aria-hidden className="size-3.5 text-brand">
                  <path
                    d="M8 14.5s-4.8-4-4.8-7.7a4.8 4.8 0 1 1 9.6 0C12.8 10.5 8 14.5 8 14.5Z M8 8.6a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>
                Санкт-Петербург и Ленинградская область
              </p>

              {/* text-pretty вместо balance: с ручными переносами балансировка
                  ломает строки в неожиданных местах. Ниже md ручной перенос
                  вешал «дом» отдельной строкой — там строки расставляет браузер,
                  а неразрывный пробел держит «94 дня» вместе */}
              <h1 className="text-pretty" data-reveal style={{ '--reveal-delay': '80ms' } as React.CSSProperties}>
                Готовый каркасный дом{' '}
                <br className="max-md:hidden" />
                под ключ за 94&nbsp;дня
              </h1>

              {/* Ниже lg подводка и кнопки скрыты: на телефоне фото должно
                  попасть в первый экран, поэтому там оно идёт сразу за
                  заголовком, а текст с кнопками рисует копия после фото */}
              <p className="lead mt-5 max-w-xl max-lg:hidden" data-reveal style={{ '--reveal-delay': '160ms' } as React.CSSProperties}>
                <strong>От 78 м² до 250 м²</strong> — проект, фундамент, каркас, кровля, инженерия
                и отделка. <strong>Смета фиксируется в договоре</strong>: за подорожание материалов
                доплачивать не придётся.
              </p>

              <div className="mt-7 hidden flex-wrap gap-2.5 lg:flex" data-reveal style={{ '--reveal-delay': '240ms' } as React.CSSProperties}>
                <Button href="#final-form" arrow>
                  Рассчитать смету
                </Button>
                <Button href="/projects" variant="outline">
                  Смотреть проекты
                </Button>
              </div>
            </div>

            {/* Карточки цифр точно по референсу: белые без рамки, фото сверху,
                цифра с приглушённым символом, единицы в подписи. Цифры всех
                карточек стоят на одной линии: блок прижат к низу, а у подписи
                зарезервирована высота в две строки.

                Ниже lg список скрыт: на телефоне фото важнее показать сразу
                после кнопок, поэтому там цифры рисует компактная копия после
                фото (скрытая копия display:none не попадает в дерево доступности) */}
            <ul className="hidden gap-2.5 lg:grid lg:grid-cols-3">
              {heroStats.map((stat, index) => (
                <li
                  key={stat.label}
                  data-reveal
                  style={{ '--reveal-delay': `${280 + index * 110}ms` } as React.CSSProperties}
                  className="card hover-lift flex min-h-[220px] flex-col rounded-xl border-transparent p-5"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-tint text-brand-deep">
                    {stat.icon}
                  </span>
                  <div className="mt-auto pt-7">
                    <div className="num text-[clamp(1.8rem,1.3rem+1.5vw,2.5rem)] leading-none tabular-nums">
                      <CountUp value={stat.value} duration={1400 + index * 250} />
                      <span className="text-ink-faint">{stat.suffix}</span>
                    </div>
                    <p className="mt-2.5 min-h-[34px] max-w-[180px] text-[12.5px] leading-[1.35] muted">
                      {stat.label}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Фото из двух слоёв заказчика в одном холсте 1024×1536: фон обрезается
              скруглённым блоком, а вырезка дома с теми же координатами лежит поверх
              без клипа слева — свес крыши выглядывает за край блока, швов нет.
              На десктопе оба слоя позиционируются одинаково (bottom -15%, left -7.5%,
              width 111%, min-height 115% с object-cover): сдвиг вниз опускает дом ближе
              к низу блока, а страховка по высоте закрывает верх и на высоких экранах.

              Ниже lg композиция другая: один слой с object-cover и кадром на дом
              (object-position 50% 72%) — дом виден целиком сразу под заголовком,
              а вырезка со свесом крыши спрятана: в одну колонку ей нечего накрывать */}
          <div className="relative min-h-[380px] max-lg:aspect-[4/5] lg:h-full">
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <Image
                src="/photos/hero-fon.webp"
                alt="Сданный каркасный дом с террасой в сосновом лесу"
                width={1024}
                height={1536}
                priority
                sizes="(min-width: 1024px) 50vw, 110vw"
                className="absolute inset-0 h-full w-full max-w-none object-cover object-[50%_72%] lg:bottom-[-15%] lg:left-[-7.5%] lg:right-auto lg:top-auto lg:h-[115%] lg:w-[111%] lg:object-bottom"
              />
              {/* Тёмный градиент сверху — белые пилюли читаются на любом небе.
                  Лежит под вырезкой дома, поэтому сам дом не затемняется */}
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-black/45 via-black/15 to-transparent"
              />
            </div>

            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[1] max-lg:hidden [clip-path:inset(0px_0px_0px_-90px_round_36px)]"
            >
              <Image
                src="/photos/hero-dom-vyrezka.webp"
                alt=""
                width={1024}
                height={1536}
                priority
                sizes="(min-width: 1024px) 50vw, 110vw"
                className="absolute bottom-[-15%] left-[-7.5%] h-[115%] w-[111%] max-w-none object-cover object-bottom"
              />
            </div>

            {/* Пилюли как в референсе: белые «Оставить заявку» и номер,
                следом — вход в личный кабинет. На одной линии с шапкой.
                На телефоне «Оставить заявку» спрятана: прямо над фото уже стоит
                кнопка «Рассчитать смету», а две пилюли не помещались в строку
                и столбиком закрывали дом. Остаётся телефон — справа */}
            <div className="absolute inset-x-4 top-6 z-[2] flex flex-wrap items-center justify-between gap-2">
              <a href="#final-form" className="btn btn--light btn--sm hidden sm:inline-flex">
                Оставить заявку
                <svg viewBox="0 0 14 14" aria-hidden className="icon-arrow size-3.5">
                  <path
                    d="M3 3h8v8M11 3 3 11"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </a>

              <span className="ml-auto flex items-center gap-2">
                <a
                  href={telHref(company.phone)}
                  aria-label={`Позвонить: ${company.phone}`}
                  className="btn btn--light btn--sm tabular-nums"
                >
                  <svg viewBox="0 0 16 16" aria-hidden className="icon-phone size-3.5 text-brand">
                    <path
                      d="M3.6 2.4h2.3l1.1 2.9-1.5 1.2a9.4 9.4 0 0 0 4 4l1.2-1.5 2.9 1.1v2.3c0 .6-.5 1.1-1.1 1-6-.6-9.9-4.5-10.5-10.5 0-.6.5-1 1-1Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {/* На узкой двухколоночной сетке (1024–1280) номер прячется,
                      остаётся иконка — пилюли не переносятся на вторую строку */}
                  <span className="lg:max-xl:hidden">{company.phone}</span>
                </a>
                <a
                  href="/lk"
                  aria-label="Личный кабинет"
                  title="Личный кабинет"
                  className="btn btn--light btn--sm btn--icon hidden sm:inline-flex"
                >
                  <svg viewBox="0 0 16 16" aria-hidden className="icon-user size-4">
                    <path
                      d="M8 7.4a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4Z M2.9 13.8c.6-2.5 2.6-3.9 5.1-3.9s4.5 1.4 5.1 3.9"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </span>
            </div>
          </div>

          {/* Мобильная копия подводки и кнопок: на телефоне они идут после
              фото, чтобы первый экран занимали заголовок и дом. Скрыта с lg */}
          <div className="px-1 pt-1 lg:hidden">
            <p className="lead" data-reveal>
              <strong>От 78 м² до 250 м²</strong> — проект, фундамент, каркас, кровля, инженерия
              и отделка. <strong>Смета фиксируется в договоре</strong>: за подорожание материалов
              доплачивать не придётся.
            </p>

            {/* На телефоне кнопки на всю ширину: две пилюли в столбик
                выглядят собранно, а зона нажатия больше */}
            <div className="mt-5 flex flex-wrap gap-2.5" data-reveal style={{ '--reveal-delay': '90ms' } as React.CSSProperties}>
              <Button href="#final-form" arrow className="max-sm:w-full">
                Рассчитать смету
              </Button>
              <Button href="/projects" variant="outline" className="max-sm:w-full">
                Смотреть проекты
              </Button>
            </div>
          </div>

          {/* Мобильная версия цифр доверия: компактные горизонтальные карточки
              после фото — иконка слева, цифра и подпись справа. На десктопе
              цифры живут внутри панели, эта копия скрыта с lg */}
          <ul className="grid gap-2 sm:grid-cols-3 lg:hidden">
            {heroStats.map((stat, index) => (
              <li
                key={stat.label}
                data-reveal
                style={{ '--reveal-delay': `${index * 90}ms` } as React.CSSProperties}
                className="card flex items-center gap-4 rounded-xl border-transparent p-4"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-tint text-brand-deep">
                  {stat.icon}
                </span>
                <div className="min-w-0">
                  <div className="num text-[22px] leading-none tabular-nums">
                    <CountUp value={stat.value} duration={1200 + index * 200} />
                    <span className="text-ink-faint">{stat.suffix}</span>
                  </div>
                  <p className="mt-1 text-[12.5px] leading-[1.35] muted">{stat.label}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
