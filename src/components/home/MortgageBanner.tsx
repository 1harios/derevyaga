import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { promises } from '@/content/company'
import { constructorConfig } from '@/lib/constructor/config'
import { plural } from '@/lib/utils'

export function MortgageBanner() {
  const family = constructorConfig.mortgage.programs.find((program) => program.id === 'family')
  const rateValue = family?.rate ?? 6
  const rate = String(rateValue).replace('.', ',')
  const days = promises.estimateDays

  return (
    <section className="pt-3 lg:pt-4" aria-labelledby="mortgage-banner-title">
      <div className="shell">
        <div className="on-dark relative isolate overflow-hidden rounded-[20px] bg-brand text-white">
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-full lg:w-[64%] lg:[mask-image:linear-gradient(to_right,transparent,#000_30%)]">
            <Image
              src="/photos/proekt-kiviniemi.webp"
              alt=""
              fill
              sizes="(min-width: 1400px) 870px, (min-width: 1024px) 64vw, 100vw"
              className="object-cover object-[50%_55%]"
            />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-dark/70 lg:bg-transparent lg:bg-[linear-gradient(90deg,rgba(25,47,33,0.94)_0%,rgba(25,47,33,0.85)_32%,rgba(25,47,33,0.55)_57%,rgba(25,47,33,0.12)_78%,rgba(25,47,33,0.28)_100%)]"
          />
          <div className="relative grid min-h-[200px] grid-cols-[auto_minmax(0,1fr)] items-center gap-x-5 gap-y-5 px-5 py-7 sm:px-7 lg:min-h-[176px] lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-x-8 lg:px-8 lg:py-8">
            <p className="flex items-center gap-1 whitespace-nowrap font-heading leading-none lg:border-r lg:border-white/25 lg:pr-8">
              <span className="text-[16px] text-white/80 sm:text-[20px]">от</span>{' '}
              {rateValue === 6 ? (
                <span className="relative block h-[68px] w-[100px] shrink-0 sm:h-[100px] sm:w-[156px]">
                  <span className="sr-only">{rate} %</span>
                  <Image
                    src="/illustrations/mortgage-six-oak.webp"
                    alt=""
                    fill
                    sizes="(min-width: 640px) 156px, 100px"
                    className="object-contain"
                  />
                </span>
              ) : (
                <span className="text-[46px] tracking-[-0.05em] sm:text-[60px]">
                  {rate}<span className="ml-1 text-[0.65em]"> %</span>
                </span>
              )}
            </p>

            <div>
              <h2 id="mortgage-banner-title" className="text-[21px] leading-[1.15] sm:text-[26px]">
                Дом в ипотеку
              </h2>
              <p className="mt-2 text-[12px] leading-[1.5] text-white/85 sm:text-[14px]">
                По семейной программе.<br className="lg:hidden" />{' '}
                <span className="max-sm:hidden">
                  Документы для банка за {days} {plural(days, ['день', 'дня', 'дней'])}.
                </span>
              </p>
            </div>

            <Button href="/mortgage" variant="light" arrow className="col-span-2 w-full lg:col-span-1 lg:w-auto">
              Рассчитать платёж
            </Button>
          </div>
        </div>
        <p className="px-2 pt-2 text-[10px] leading-[1.5] text-ink-soft sm:px-4 sm:text-[11px]">
          Условия и одобрение определяет банк. Не является публичной офертой. Изображения — визуализация.
        </p>
      </div>
    </section>
  )
}
