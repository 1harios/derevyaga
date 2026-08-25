import { Fragment } from 'react'
import Image from 'next/image'
import { HeaderInline } from '@/components/layout/HeaderInline'
import { HeroProjectCard } from '@/components/home/HeroProjectCard'
import { Button } from '@/components/ui/Button'
import { CountUp } from '@/components/ui/CountUp'
import { company } from '@/content/company'
import { telHref } from '@/lib/utils'

/**
 * Первый экран: серая панель-ячейка слева и фото справа, как в исходной
 * компоновке — дом-вырезка выходит за рамку фотоблока (двухслойный приём).
 * Внутри панели — обновлённое наполнение: крупный заголовок, теглайн
 * с линией, абзац с кнопкой «Рассчитать смету», строка цифр и мини-карточка
 * проекта со стрелками листания. На фото — пилюли «Оставить заявку»,
 * телефон и личный кабинет.
 */

/** ЗАМЕНИТЬ: цифры доверия — заглушки из брифа.
    Как в референсе: просто цифры с тонкими разделителями, без плашек */
const heroStats = [
  { value: 94, suffix: '~', label: 'дня средний срок стройки' },
  { value: 5, suffix: '+', label: 'лет гарантии на конструктив' },
  { value: 218, suffix: '+', label: 'домов сдано с 2011 года' },
]

export function Hero() {
  return (
    <section className="pt-1">
      <div className="shell">
        <div className="grid gap-3 lg:h-[calc(100svh-16px)] lg:min-h-[700px] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-4">
          {/* Левая панель: шапка, текст, цифры и мини-карточка проекта */}
          <div className="panel panel--sheen flex flex-col gap-8 pt-6">
            <HeaderInline />

            <div>
              <h1 className="text-pretty" data-reveal>
                Готовый каркасный дом{' '}
                <br className="max-md:hidden" />
                под ключ за 94&nbsp;дня
              </h1>

              {/* Теглайн с линией */}
              <div
                className="mt-4 flex items-center gap-4"
                data-reveal
                style={{ '--reveal-delay': '120ms' } as React.CSSProperties}
              >
                <span className="shrink-0 font-sans text-[13px] font-medium text-[#1b211d]">
                  Санкт-Петербург и Ленинградская область
                </span>
                <span aria-hidden className="h-px min-w-8 flex-1 bg-black/10" />
              </div>

              {/* Абзац и кнопка: ниже lg скрыты — на телефоне идут после фото */}
              <div
                className="mt-7 hidden flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 lg:flex"
                data-reveal
                style={{ '--reveal-delay': '200ms' } as React.CSSProperties}
              >
                <p className="max-w-[380px] font-sans text-[13.5px] leading-[1.55] text-[#6a6a6a]">
                  От 78 до 250 м²: проект, фундамент, каркас, кровля, инженерия и отделка.{' '}
                  <span className="text-[#1b211d]">Смета фиксируется в договоре.</span>
                </p>
                <Button href="/calculator" arrow className="shrink-0">
                  Рассчитать смету
                </Button>
              </div>
            </div>

            {/* Цифры как в референсе: отдельный ярус панели с автоцентровкой —
                расстояние сверху и снизу одинаковое; крайние блоки по краям,
                промежутки между блоками и палочками строго равные */}
            <div
              className="my-auto hidden w-full items-start justify-between gap-4 lg:flex"
              data-reveal
              style={{ '--reveal-delay': '260ms' } as React.CSSProperties}
            >
              {heroStats.map((stat, index) => (
                <Fragment key={stat.label}>
                  {index > 0 ? (
                    <span aria-hidden className="h-11 w-px shrink-0 bg-black/10" />
                  ) : null}
                  <div>
                    <div className="num text-[clamp(1.7rem,1.2rem+1.3vw,2.3rem)] leading-none [font-variant-numeric:normal]">
                      <CountUp value={stat.value} duration={1400 + index * 250} />
                      <span className="text-ink-faint">{stat.suffix}</span>
                    </div>
                    <p className="mt-2 text-[11px] leading-[1.35] whitespace-nowrap muted xl:text-[12.5px]">
                      {stat.label}
                    </p>
                  </div>
                </Fragment>
              ))}
            </div>

            {/* Мини-карточка проекта — низ панели */}
            <div className="max-lg:hidden">
              <div className="lg:h-[clamp(170px,24svh,320px)]">
                <HeroProjectCard className="lg:h-full" />
              </div>
            </div>
          </div>

          {/* Фото из двух слоёв: фон обрезается скруглённым блоком, а вырезка
              дома лежит поверх без клипа слева — свес крыши выглядывает
              за край блока. Ниже lg — один слой с кадром на дом */}
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
              {/* Тёмный градиент сверху — белые пилюли читаются на любом небе */}
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
            <p className="font-sans text-[14px] leading-[1.55] text-[#6a6a6a]" data-reveal>
              От 78 до 250 м²: проект, фундамент, каркас, кровля, инженерия и отделка.{' '}
              <span className="text-[#1b211d]">Смета фиксируется в договоре.</span>
            </p>
            <div className="mt-4" data-reveal style={{ '--reveal-delay': '90ms' } as React.CSSProperties}>
              <Button href="/calculator" arrow className="max-sm:w-full">
                Рассчитать смету
              </Button>
            </div>
          </div>

          {/* Мобильная версия цифр: тот же стиль без плашек, с разделителями */}
          <div className="flex items-start justify-between gap-3 px-1 lg:hidden" data-reveal>
            {heroStats.map((stat, index) => (
              <Fragment key={stat.label}>
                {index > 0 ? (
                  <span aria-hidden className="mt-0.5 h-9 w-px shrink-0 bg-black/10" />
                ) : null}
                <div className="min-w-0">
                  <div className="num text-[22px] leading-none [font-variant-numeric:normal]">
                    <CountUp value={stat.value} duration={1200 + index * 200} />
                    <span className="text-ink-faint">{stat.suffix}</span>
                  </div>
                  <p className="mt-1 text-[11.5px] leading-[1.35] muted">{stat.label}</p>
                </div>
              </Fragment>
            ))}
          </div>

          <div className="lg:hidden">
            <HeroProjectCard />
          </div>
        </div>
      </div>
    </section>
  )
}
