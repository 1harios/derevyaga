import { Fragment } from 'react'
import Image from 'next/image'
import { HeaderInline } from '@/components/layout/HeaderInline'
import { Button } from '@/components/ui/Button'
import { CountUp } from '@/components/ui/CountUp'
import { company } from '@/content/company'
import { telHref } from '@/lib/utils'

/**
 * Первый экран: серая панель-ячейка слева и фото справа, как в исходной
 * компоновке — дом-вырезка выходит за рамку фотоблока (двухслойный приём).
 * Внутри панели: крупный заголовок, теглайн с линией, абзац с кнопкой
 * «Рассчитать проект» и строка цифр с разделителями. На фото — пилюли
 * «Оставить заявку», телефон и личный кабинет.
 */

/** ЗАМЕНИТЬ: цифры доверия — заглушки из брифа.
    Как в референсе: просто цифры с тонкими разделителями, без плашек */
const heroStats = [
  // Знак «примерно» стоит ПЕРЕД числом: «~94», а не «94~»
  { value: 94, prefix: '~', suffix: '', label: 'дня средний срок стройки' },
  { value: 5, prefix: '', suffix: '+', label: 'лет гарантии на конструктив' },
  { value: 218, prefix: '', suffix: '+', label: 'домов сдано с 2011 года' },
]

export function Hero() {
  return (
    <section className="pt-1">
      <div className="shell">
        <div className="grid gap-3 lg:h-[calc(100svh-16px)] lg:min-h-[700px] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-4">
          {/* Левая панель: шапка, текст, цифры и мини-карточка проекта */}
          <div className="panel panel--sheen flex flex-col pt-6">
            <HeaderInline />

            {/* Заголовок и теглайн — верхний ярус */}
            <div className="mt-8 lg:mt-[clamp(2rem,5svh,3.5rem)]">
              <h1 className="text-pretty lg:text-[clamp(40px,2vw+20px,54px)] lg:leading-[1.06]" data-reveal>
                Строительство{' '}
                <br className="max-md:hidden" />
                Каркасных домов
              </h1>

              {/* Теглайн с линией */}
              <div
                className="mt-4 flex items-center gap-4"
                data-reveal
                style={{ '--reveal-delay': '120ms' } as React.CSSProperties}
              >
                <span className="min-w-0 font-sans text-[12.5px] font-medium text-ink sm:shrink-0 sm:text-[13px]">
                  Строим в Санкт-Петербурге и Ленинградской области
                </span>
                <span aria-hidden className="hidden h-px min-w-8 flex-1 bg-black/10 sm:block" />
              </div>

            </div>

            {/* Абзац и кнопки — средний ярус, центрируется в свободном
                пространстве между заголовком и цифрами.
                Ниже lg скрыт: на телефоне идёт после фото */}
            <div className="my-auto hidden py-8 lg:block">
              <p
                className="max-w-[500px] font-sans text-[15px] leading-[1.6] text-ink-soft"
                data-reveal
                style={{ '--reveal-delay': '200ms' } as React.CSSProperties}
              >
                Проектируем и строим дома от 78 до 250 м² — от первого эскиза до готовой отделки.{' '}
                <span className="text-ink">
                  Стоимость и срок фиксируем в договоре до начала работ.
                </span>
              </p>
              <div
                className="mt-6 flex flex-wrap gap-2.5"
                data-reveal
                style={{ '--reveal-delay': '240ms' } as React.CSSProperties}
              >
                <Button href="/calculator" arrow>
                  Рассчитать проект
                </Button>
                <Button href="/projects" variant="outline">
                  Каталог объектов
                </Button>
              </div>
            </div>

            {/* Цифры — якорь низа панели: тонкая линия во всю ширину,
                крупные числа, равные промежутки между блоками и палочками */}
            <div
              className="mt-auto hidden w-full items-start justify-between gap-4 border-t border-black/[0.07] pt-6 lg:flex"
              data-reveal
              style={{ '--reveal-delay': '260ms' } as React.CSSProperties}
            >
              {heroStats.map((stat, index) => (
                <Fragment key={stat.label}>
                  {index > 0 ? (
                    <span aria-hidden className="h-12 w-px shrink-0 bg-black/10" />
                  ) : null}
                  <div>
                    <div className="num text-[clamp(2rem,1.4rem+1.6vw,2.75rem)] leading-none [font-variant-numeric:normal]">
                      {stat.prefix ? <span className="text-ink-faint">{stat.prefix}</span> : null}
                      <CountUp value={stat.value} duration={1400 + index * 250} />
                      {stat.suffix ? <span className="text-ink-faint">{stat.suffix}</span> : null}
                    </div>
                    <p className="mt-2 text-[12px] leading-[1.35] whitespace-nowrap muted xl:text-[13.5px]">
                      {stat.label}
                    </p>
                  </div>
                </Fragment>
              ))}
            </div>

          </div>

          {/* Фото из двух слоёв: фон обрезается скруглённым блоком, а вырезка
              дома лежит поверх без клипа слева — козырёк выглядывает за край
              блока. Кадрирование по референсу: дом крупно, лес сверху.
              Ниже lg — один слой */}
          <div className="relative min-h-[380px] max-lg:aspect-[4/5] lg:h-full">
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <Image
                src="/photos/hero2-fon.webp"
                alt="Каркасный дом цвета мха с крыльцом на фоне соснового леса"
                width={1696}
                height={2528}
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="absolute inset-0 h-full w-full max-w-none object-cover object-[50%_55%] lg:left-[-11%] lg:right-auto lg:w-[114%]"
              />
              {/* Тёмный градиент сверху — белые пилюли читаются на любом небе */}
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-black/40 via-black/12 to-transparent"
              />
            </div>

            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[1] max-lg:hidden [clip-path:inset(0px_0px_0px_-90px_round_36px)]"
            >
              <Image
                src="/photos/hero2-dom.webp"
                alt=""
                width={1696}
                height={2528}
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="absolute inset-0 h-full w-full max-w-none object-cover object-[50%_55%] lg:left-[-11%] lg:right-auto lg:w-[114%]"
              />
            </div>

            {/* Пилюли: «Оставить заявку» слева, телефон и кабинет справа */}
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

          {/* Мобильная копия абзаца и кнопки: после фото */}
          <div className="px-1 pt-1 lg:hidden">
            <p className="font-sans text-[14px] leading-[1.55] text-ink-soft" data-reveal>
              Проектируем и строим дома от 78 до 250 м² — от первого эскиза до готовой отделки.{' '}
              <span className="text-ink">
                Стоимость и срок фиксируем в договоре до начала работ.
              </span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5" data-reveal style={{ '--reveal-delay': '90ms' } as React.CSSProperties}>
              <Button href="/calculator" arrow className="max-sm:w-full">
                Рассчитать проект
              </Button>
              <Button href="/projects" variant="outline" className="max-sm:w-full">
                Каталог объектов
              </Button>
            </div>
          </div>

          {/* На узких экранах цифры собраны в один спокойный список. */}
          <div className="rounded-[18px] border border-line bg-panel px-4 lg:hidden" data-reveal>
            {heroStats.map((stat, index) => (
              <div
                key={stat.label}
                className={`grid grid-cols-[76px_minmax(0,1fr)] items-center gap-4 py-3.5 ${
                  index > 0 ? 'border-t border-line' : ''
                }`}
              >
                  <div className="num text-[25px] leading-none [font-variant-numeric:normal]">
                    {stat.prefix ? <span className="text-ink-faint">{stat.prefix}</span> : null}
                    <CountUp value={stat.value} duration={1200 + index * 200} />
                    {stat.suffix ? <span className="text-ink-faint">{stat.suffix}</span> : null}
                  </div>
                  <p className="text-[12.5px] leading-[1.4] muted">{stat.label}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
