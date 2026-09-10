import Image from 'next/image'
import Link from 'next/link'
import { LuFileCheck2, LuHeartHandshake, LuWallet } from 'react-icons/lu'
import { ArrowIcon, Button } from '@/components/ui/Button'
import { promises } from '@/content/company'
import { constructorConfig } from '@/lib/constructor/config'
import { plural } from '@/lib/utils'

export function MortgageBanner() {
  const family = constructorConfig.mortgage.programs.find((program) => program.id === 'family')
  const rate = String(family?.rate ?? 6).replace('.', ',')
  const days = promises.estimateDays
  const benefits = [
    {
      icon: LuWallet,
      title: 'Без предоплаты за стройку',
      text: 'Оплата по этапам, а не вперёд',
    },
    {
      icon: LuFileCheck2,
      title: `Документы за ${days} ${plural(days, ['день', 'дня', 'дней'])}`,
      text: 'Подготовим договор и смету для банка',
    },
    {
      icon: LuHeartHandshake,
      title: 'Принимаем маткапитал',
      text: 'Можно использовать вместе с ипотекой',
    },
  ]

  return (
    <section className="pt-3 lg:pt-4" aria-labelledby="mortgage-banner-title">
      <div className="shell">
        <div className="on-dark overflow-hidden rounded-2xl bg-dark text-white">
          <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
            <div className="px-6 pt-8 pb-7 sm:p-10 lg:p-12 xl:px-14">
              <h2 id="mortgage-banner-title" className="text-[32px] leading-[1.12] sm:text-[40px] xl:text-[44px]" data-reveal>
                Дом в ипотеку{' '}
                <span className="mt-4 flex items-baseline gap-3 text-[#dce8ce] sm:gap-4">
                  <span className="text-[28px] tracking-normal sm:text-[32px]">от</span>{' '}
                  <span className="text-[104px] leading-none tracking-[-0.065em] sm:text-[128px] xl:text-[144px]">
                    {rate}<span className="ml-2 text-[0.55em] tracking-[-0.04em]"> %</span>
                  </span>
                </span>{' '}
                <span className="mt-3 block font-sans text-[15px] leading-normal tracking-normal text-white/75 sm:text-[16px]">
                  по семейной программе
                </span>
              </h2>

              <p
                className="mt-6 max-w-[390px] text-[14px] leading-[1.65] text-white/75 sm:text-[15px]"
                data-reveal
                style={{ '--reveal-delay': '100ms' } as React.CSSProperties}
              >
                Вы выбираете дом, мы готовим документы для банка. Работаем с семейной и обычной ипотекой на ИЖС.
              </p>

              <div
                className="mt-7 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 lg:mt-8"
                data-reveal
                style={{ '--reveal-delay': '180ms' } as React.CSSProperties}
              >
                <Button href="/mortgage" variant="light" arrow className="max-sm:w-full">
                  Рассчитать платёж
                </Button>
                <Link
                  href="/calculator"
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full text-[14px] text-white/85 transition-colors hover:text-white"
                >
                  <span className="underline-offset-4 group-hover:underline">Собрать свой дом</span>
                  <ArrowIcon className="size-3" />
                </Link>
              </div>
            </div>

            <div
              className="group relative mx-3 mb-3 aspect-[4/3] overflow-hidden rounded-[26px] sm:aspect-[16/10] lg:mt-3 lg:ml-0 lg:aspect-auto"
              data-reveal="zoom"
              style={{ '--reveal-delay': '120ms' } as React.CSSProperties}
            >
              <Image
                src="/photos/mortgage-banner.webp"
                alt="Семья с ключами от нового дома на террасе каркасного дома цвета мха"
                width={1600}
                height={1067}
                sizes="(min-width: 1400px) 650px, (min-width: 1024px) 48vw, 100vw"
                className="absolute inset-0 h-full w-full object-cover object-[72%_50%] transition-transform duration-[1400ms] ease-out motion-safe:group-hover:scale-[1.03]"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent" />
              <p className="absolute right-6 bottom-6 left-6 font-heading text-[26px] leading-[1.15] tracking-[-0.02em] sm:right-8 sm:bottom-8 sm:left-8 sm:text-[32px]">
                Свой дом.<br />Для всей семьи.
              </p>
            </div>
          </div>

          <div className="border-t border-white/15 px-6 sm:px-10 lg:px-12 xl:px-14">
            <ul className="grid divide-y divide-white/15 lg:grid-cols-3 lg:divide-x lg:divide-y-0 lg:py-6">
              {benefits.map(({ icon: Icon, title, text }) => (
                <li
                  key={title}
                  className="flex items-start gap-3 py-5 lg:px-6 lg:py-0 lg:first:pl-0 lg:last:pr-0 xl:gap-4 xl:px-8"
                >
                  <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-[#dce8ce]" strokeWidth={1.5} />
                  <div>
                    <p className="font-heading text-[15px] leading-[1.4]">{title}</p>
                    <p className="mt-1 text-[12px] leading-[1.5] text-white/65 sm:text-[13px]">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="px-3 pt-3 text-[11px] leading-[1.5] text-ink-soft sm:px-5 sm:text-[12px]">
          Условия программы и решение об одобрении определяет банк. Не является публичной офертой.
        </p>
      </div>
    </section>
  )
}
