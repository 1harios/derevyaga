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
        <div className="on-dark grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-5 gap-y-5 rounded-[20px] bg-brand px-5 py-5 text-white sm:px-7 sm:py-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-x-8 lg:px-8 lg:py-7">
          <p className="flex items-baseline gap-2 whitespace-nowrap font-heading leading-none lg:border-r lg:border-white/25 lg:pr-8">
            <span className="text-[16px] text-white/80 sm:text-[20px]">от</span>{' '}
            <span className="text-[46px] tracking-[-0.05em] sm:text-[60px]">
              {rate}<span className="ml-1 text-[0.65em]"> %</span>
            </span>
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
        <p className="px-2 pt-2 text-[10px] leading-[1.5] text-ink-soft sm:px-4 sm:text-[11px]">
          Условия и одобрение определяет банк. Не является публичной офертой.
        </p>
      </div>
    </section>
  )
}
