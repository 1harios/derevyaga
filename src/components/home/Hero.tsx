import Image from 'next/image'
import Link from 'next/link'
import { HeaderInline } from '@/components/layout/HeaderInline'
import { HeroCalcControls } from '@/components/home/HeroCalcControls'
import { HeroProjectCard } from '@/components/home/HeroProjectCard'
import { Button, ArrowIcon } from '@/components/ui/Button'
import { CountUp } from '@/components/ui/CountUp'
import { company } from '@/content/company'
import { telHref } from '@/lib/utils'

/**
 * Первый экран по референсу заказчика: весь герой — белая «плавающая»
 * карточка с крупным скруглением поверх размытого фото. Слева очень крупный
 * заголовок с кластером фото клиентов, теглайн с линией, номерной абзац
 * с тёмной кнопкой, строка цифр и мини-карточка проекта со стрелками.
 * Справа — скруглённая фотопанель: плавающая карточка локации, телефон,
 * подпись поверх фото и селекты, ведущие в калькулятор с предзаполнением.
 */

/** ЗАМЕНИТЬ: цифры доверия — заглушки из брифа */
const heroStats = [
  { value: 218, suffix: '+', label: 'домов сдано с 2011 года' },
  { value: 15, suffix: '', label: 'лет строим в Ленобласти' },
  { value: 94, suffix: '~', label: 'дня средний срок под ключ' },
]

const heroAvatars = [
  { src: '/photos/otzyv-para.webp', alt: 'Семейная пара — клиенты «Деревяги» из отзыва' },
  { src: '/photos/otzyv-muzhchina.webp', alt: 'Владелец дома — клиент «Деревяги» из отзыва' },
  { src: '/photos/otzyv-zhenshchina.webp', alt: 'Владелица дома — клиентка «Деревяги» из отзыва' },
]

export function Hero() {
  return (
    <section className="relative">
      {/* Фон вокруг карточки: то же фото героя, размытое и приглушённое */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/photos/hero-fon.webp"
          alt=""
          width={1024}
          height={1536}
          priority
          sizes="100vw"
          className="h-full w-full scale-110 object-cover object-[50%_30%] blur-lg brightness-[0.82]"
        />
      </div>

      <div className="px-2 pt-2 pb-4 sm:px-3 sm:pt-3 sm:pb-6">
        <div className="mx-auto max-w-[1400px] rounded-3xl bg-white p-2 shadow-[0_24px_80px_rgba(20,26,22,0.28)] sm:rounded-[28px] sm:p-2.5">
          {/* Шапка живёт в карточке, как в референсе */}
          <div className="px-2.5 pt-2.5 pb-1 sm:px-4 sm:pt-3">
            <HeaderInline />
          </div>

          <div className="mt-1.5 grid gap-2 sm:gap-2.5 lg:min-h-[calc(100svh-170px)] lg:grid-cols-[minmax(0,1.06fr)_minmax(0,1fr)]">
            {/* ЛЕВАЯ КОЛОНКА */}
            <div className="flex flex-col px-2.5 pt-4 pb-2 sm:px-4 lg:pt-6 lg:pb-2">
              <div className="flex items-start justify-between gap-5">
                <h1
                  className="text-pretty text-[clamp(34px,2.6vw+17px,58px)] leading-[1.05]"
                  data-reveal
                >
                  Готовый каркасный дом под&nbsp;ключ за&nbsp;94&nbsp;дня
                </h1>

                {/* Кластер фото клиентов — как в референсе, ведёт к отзывам */}
                <Link
                  href="/reviews"
                  className="mt-2 hidden shrink-0 flex-col items-center gap-1.5 transition-opacity duration-200 hover:opacity-85 md:flex"
                  data-reveal
                  style={{ '--reveal-delay': '120ms' } as React.CSSProperties}
                >
                  <span className="flex -space-x-2.5">
                    {heroAvatars.map((avatar) => (
                      <Image
                        key={avatar.src}
                        src={avatar.src}
                        alt={avatar.alt}
                        width={96}
                        height={96}
                        className="size-11 rounded-full object-cover ring-2 ring-white"
                      />
                    ))}
                  </span>
                  <span className="font-sans text-[11.5px] text-[#6a6a6a]">200+ клиентов</span>
                </Link>
              </div>

              {/* Теглайн с линией */}
              <div
                className="mt-4 flex items-center gap-4"
                data-reveal
                style={{ '--reveal-delay': '160ms' } as React.CSSProperties}
              >
                <span className="shrink-0 font-sans text-[13px] font-medium text-[#1b211d]">
                  Санкт-Петербург и Ленинградская область
                </span>
                <span aria-hidden className="h-px min-w-8 flex-1 bg-black/10" />
              </div>

              {/* Номерной абзац и тёмная кнопка */}
              <div
                className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                data-reveal
                style={{ '--reveal-delay': '220ms' } as React.CSSProperties}
              >
                <p className="flex max-w-[360px] gap-3 font-sans text-[13.5px] leading-[1.5] text-[#6a6a6a]">
                  <span className="shrink-0 font-medium text-[#1b211d]">01</span>
                  <span>
                    От 78 до 250 м²: проект, фундамент, каркас, кровля, инженерия и отделка.{' '}
                    <span className="text-[#1b211d]">Смета фиксируется в договоре.</span>
                  </span>
                </p>
                <Button href="/calculator" arrow className="shrink-0 max-sm:w-full">
                  Рассчитать смету
                </Button>
              </div>

              {/* Строка цифр */}
              <div
                className="mt-6 grid grid-cols-3 gap-4 border-t border-black/[0.06] pt-5"
                data-reveal
                style={{ '--reveal-delay': '280ms' } as React.CSSProperties}
              >
                {heroStats.map((stat, index) => (
                  <div key={stat.label}>
                    <div className="num text-[clamp(24px,1.4vw+13px,32px)] leading-none tabular-nums">
                      <CountUp value={stat.value} duration={1200 + index * 200} />
                      <span className="text-ink-faint">{stat.suffix}</span>
                    </div>
                    <p className="mt-1.5 max-w-[150px] font-sans text-[12px] leading-[1.35] text-[#6a6a6a]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Мини-карточка проекта — прижата к низу колонки */}
              <div className="mt-6 lg:mt-auto lg:pt-6">
                <HeroProjectCard />
              </div>
            </div>

            {/* ПРАВАЯ ФОТОПАНЕЛЬ */}
            <div className="relative overflow-hidden rounded-2xl max-lg:aspect-[4/5] max-lg:min-h-[420px] sm:rounded-[22px]">
              <Image
                src="/photos/hero-fon.webp"
                alt="Сданный каркасный дом с террасой в сосновом лесу"
                width={1024}
                height={1536}
                priority
                sizes="(min-width: 1024px) 46vw, 96vw"
                className="absolute inset-0 h-full w-full object-cover object-[50%_74%]"
              />
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-[32%] bg-gradient-to-b from-black/40 via-black/10 to-transparent"
              />
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-black/60 via-black/25 to-transparent"
              />

              {/* Верхний ряд: карточка локации и телефон с кабинетом */}
              <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2 sm:inset-x-4 sm:top-4">
                <Link
                  href="/objects"
                  className="flex items-center gap-2.5 rounded-2xl bg-white p-1.5 pr-2 shadow-[0_2px_10px_rgba(20,26,22,0.18)] transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <Image
                    src="/photos/obekt-ladoga-karkas.webp"
                    alt=""
                    width={120}
                    height={120}
                    className="size-11 rounded-xl object-cover"
                  />
                  <span className="font-sans text-[12.5px] leading-[1.25] text-[#1b211d]">
                    Построенные дома
                    <br />
                    <span className="text-[#6a6a6a]">СПб и Ленобласть</span>
                  </span>
                  <span className="ml-1 grid size-8 shrink-0 place-items-center rounded-full bg-[#1e2521] text-white">
                    <ArrowIcon className="size-3" />
                  </span>
                </Link>

                <span className="flex items-center gap-2">
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
                    <span className="max-sm:hidden lg:max-xl:hidden">{company.phone}</span>
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

              {/* Низ фотопанели: подпись и селекты калькулятора */}
              <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4">
                <p className="max-w-md border-l-2 border-white/70 pl-3 font-sans text-[13.5px] leading-[1.5] text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]">
                  Проект, фундамент, тёплый контур, инженерия и отделка — одной командой
                  по одному договору.
                </p>
                <div className="mt-3.5">
                  <HeroCalcControls />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
