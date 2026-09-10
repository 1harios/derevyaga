import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { promises } from '@/content/company'
import { constructorConfig } from '@/lib/constructor/config'
import { plural } from '@/lib/utils'

export function MortgageBanner() {
  const family = constructorConfig.mortgage.programs.find((program) => program.id === 'family')
  const rate = String(family?.rate ?? 6).replace('.', ',')
  const days = promises.estimateDays

  return (
    <section className="pt-3 lg:pt-4" aria-labelledby="mortgage-banner-title">
      <div className="shell">
        <div className="relative isolate overflow-hidden rounded-[20px] bg-panel bg-[radial-gradient(ellipse_at_85%_100%,#d8ded5_0%,transparent_65%)]">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-[110px] top-[174px] w-[330px] select-none sm:-right-[120px] sm:top-7 sm:w-[420px] lg:right-6 lg:top-4 lg:w-[540px] xl:right-14 xl:w-[560px]"
          >
            <Image
              src="/illustrations/mortgage-brochure.webp"
              alt=""
              width={1600}
              height={1164}
              sizes="(min-width: 1280px) 560px, (min-width: 1024px) 540px, (min-width: 640px) 420px, 330px"
              className="h-auto w-full drop-shadow-[8px_16px_14px_rgba(37,49,39,0.18)]"
            />
          </div>

          <div className="relative flex min-h-[294px] flex-col items-start px-5 py-6 sm:min-h-[240px] sm:w-[58%] sm:px-7 sm:py-7 lg:w-[56%] lg:px-10 lg:py-8">
            <p className="mb-2 text-[10px] font-medium tracking-[0.14em] text-brand sm:text-[11px]">
              ДЛЯ ВАШЕЙ СЕМЬИ
            </p>
            <h2 id="mortgage-banner-title" className="text-[26px] leading-[1.15] sm:text-[29px] lg:text-[32px]">
              Дом в ипотеку<br className="xl:hidden" />{' '}
              <span className="whitespace-nowrap text-brand">от {rate} %</span>
            </h2>
            <p className="mt-3 max-w-[270px] text-[12px] leading-[1.6] text-ink-soft sm:max-w-[260px] sm:text-[13px] lg:max-w-[340px] xl:max-w-[390px]">
              По семейной программе. Подготовим документы для банка за {days} {plural(days, ['день', 'дня', 'дней'])}.
            </p>
            <Button href="/mortgage" arrow className="mt-6 max-sm:mt-auto max-sm:text-[12px]">
              Рассчитать платёж
            </Button>
          </div>
        </div>
        <p className="px-2 pt-2 text-[10px] leading-[1.5] text-ink-soft sm:px-4 sm:text-[11px]">
          Условия и одобрение определяет банк. Не является публичной офертой. Изображение — визуализация.
        </p>
      </div>
    </section>
  )
}
