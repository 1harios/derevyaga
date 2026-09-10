import Image from 'next/image'
import Link from 'next/link'
import { LuCheck, LuHouse } from 'react-icons/lu'
import { ArrowIcon, Button } from '@/components/ui/Button'
import { promises } from '@/content/company'
import { constructorConfig } from '@/lib/constructor/config'
import { plural } from '@/lib/utils'

export function MortgageBanner() {
  const family = constructorConfig.mortgage.programs.find((program) => program.id === 'family')
  const rate = String(family?.rate ?? 6).replace('.', ',')
  const days = promises.estimateDays
  const benefits = [
    { title: 'Без предоплаты за стройку', text: 'Оплата по принятым этапам' },
    {
      title: `Документы за ${days} ${plural(days, ['день', 'дня', 'дней'])}`,
      text: 'Договор и смету для банка подготовим сами',
    },
    { title: 'Можно с маткапиталом', text: 'Вместе с ипотекой на строительство' },
  ]

  return (
    <section className="pt-3 lg:pt-4" aria-labelledby="mortgage-banner-title">
      <div className="shell">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-4">
          <div className="relative isolate flex min-h-[400px] flex-col overflow-hidden rounded-2xl bg-[#e9ede4] sm:min-h-[520px] lg:min-h-0">
            <div className="relative z-10 px-6 pt-7 sm:px-10 sm:pt-10" data-reveal>
              <h2 id="mortgage-banner-title" className="text-[30px] leading-[1.12] tracking-[-0.035em] sm:text-[44px] xl:text-[48px]">
                Свой дом.<br />
                <span className="text-brand">Ближе, чем кажется.</span>
              </h2>
              <p className="mt-4 max-w-[300px] text-[13px] leading-[1.5] text-ink-soft sm:text-[14px]">
                Постройте дом для семьи<br />с ипотекой на ИЖС.
              </p>
            </div>

            <div className="relative mt-auto h-[265px] shrink-0 sm:h-[360px] lg:h-[390px] xl:h-[430px]" data-reveal="zoom">
              <Image
                src="/illustrations/family-home.webp"
                alt="3D-иллюстрация каркасного дома цвета мха: панорамные окна, деревянная терраса и сад с соснами"
                width={1800}
                height={1400}
                sizes="(min-width: 1400px) 827px, (min-width: 1024px) 60vw, 100vw"
                className="h-full w-full object-contain"
              />
            </div>
            <p className="absolute right-6 bottom-4 z-10 text-[10px] tracking-wide text-ink-soft sm:right-8 sm:bottom-5 sm:text-[11px]">
              Концепт дома · 3D-иллюстрация
            </p>
          </div>

          <div className="flex flex-col rounded-2xl border border-line bg-[#f7f6f2] p-6 sm:p-8 xl:p-10">
            <p className="flex items-center gap-2.5 font-heading text-[16px] text-brand">
              <LuHouse aria-hidden className="size-5" strokeWidth={1.5} />
              Семейная ипотека
            </p>

            <p className="mt-5 flex items-baseline gap-3 font-heading leading-none text-ink">
              <span className="text-[24px] text-ink-soft">от</span>{' '}
              <span className="text-[88px] tracking-[-0.07em] sm:text-[104px]">
                {rate}<span className="ml-1 text-[0.6em] tracking-[-0.05em]"> %</span>
              </span>
            </p>
            <p className="mt-2 text-[13px] text-ink-soft">годовых на строительство дома</p>

            <ul className="my-6 grid gap-5 border-t border-line pt-6">
              {benefits.map(({ title, text }) => (
                <li key={title} className="flex items-start gap-3">
                  <span aria-hidden className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
                    <LuCheck className="size-3" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="font-heading text-[14px] leading-[1.35] sm:text-[15px]">{title}</p>
                    <p className="mt-1 text-[12px] leading-[1.5] text-ink-soft">{text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              <Button href="/mortgage" arrow wide className="justify-between bg-brand px-5 hover:bg-brand-deep">
                Рассчитать платёж
              </Button>
              <Link
                href="/calculator"
                className="group mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full text-[13px] text-ink-soft transition-colors hover:text-ink"
              >
                <span className="underline-offset-4 group-hover:underline">Собрать свой дом</span>
                <ArrowIcon className="size-3" />
              </Link>
              <p className="mt-3 text-[10px] leading-[1.5] text-ink-soft sm:text-[11px]">
                Условия и одобрение определяет банк.<br />Не является публичной офертой.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
