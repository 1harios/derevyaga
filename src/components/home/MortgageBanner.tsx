import { Button } from '@/components/ui/Button'
import { promises } from '@/content/company'
import { constructorConfig } from '@/lib/constructor/config'
import { plural } from '@/lib/utils'

export function MortgageBanner() {
  const family = constructorConfig.mortgage.programs.find((program) => program.id === 'family')
  const rate = String(family?.rate ?? 6).replace('.', ',')
  const days = promises.estimateDays
  const rateSize = rate.length > 2
    ? 'text-[58px] sm:text-[88px] lg:text-[108px]'
    : 'text-[88px] sm:text-[120px] lg:text-[156px]'

  return (
    <section className="pt-3 lg:pt-4" aria-labelledby="mortgage-banner-title">
      <div className="shell">
        <div className="on-dark grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-5 gap-y-6 rounded-[20px] bg-dark px-5 py-7 text-white sm:gap-x-8 sm:px-8 sm:py-8 lg:min-h-[232px] lg:grid-cols-[220px_minmax(0,1fr)_auto] lg:gap-x-10 lg:px-10">
          <p className="font-heading text-[#dce6d1]">
            <span className="mb-2 block text-[12px] leading-none text-white/65 sm:text-[14px]">от</span>
            <span className={`flex items-baseline gap-1 whitespace-nowrap leading-[0.8] tracking-[-0.07em] ${rateSize}`}>
              {rate}<span className="text-[0.46em] tracking-[-0.04em]">%</span>
            </span>
            <span className="mt-3 block text-[11px] leading-none text-white/65 sm:mt-4 sm:text-[12px]">годовых</span>
          </p>

          <div className="lg:border-l lg:border-white/15 lg:py-2 lg:pl-10">
            <h2 id="mortgage-banner-title" className="text-[20px] leading-[1.2] tracking-[-0.025em] sm:text-[28px] lg:text-[32px] xl:text-[34px]">
              Свой дом.<br />
              <span className="text-white/65">Семейная ипотека.</span>
            </h2>
            <p className="mt-3 max-w-[270px] text-[11px] leading-[1.6] text-white/65 sm:mt-4 sm:text-[13px]">
              Документы для банка за{' '}
              <span className="whitespace-nowrap">{days} {plural(days, ['день', 'дня', 'дней'])}.</span>
            </p>
          </div>

          <Button
            href="/mortgage"
            variant="light"
            arrow
            className="col-span-2 w-full bg-[#edf1e8] lg:col-span-1 lg:w-auto"
          >
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
