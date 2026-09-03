import { Fragment } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { promises } from '@/content/company'
import { constructorConfig } from '@/lib/constructor/config'
import { plural } from '@/lib/utils'

/**
 * Плашка про ипотеку сразу под первым экраном. Компоновка по референсу:
 * слева заголовок, короткая подводка, три цифры и одна кнопка; справа —
 * фото семьи с ключами на террасе дома, заполняющее правую половину панели.
 * Ставка берётся из конфига конструктора — цифра на главной и в калькуляторе одна.
 */

/** «6 %», «19,6 %» — запятая в дробной части и неразрывный пробел перед знаком */
function formatRate(value: number): string {
  return `${String(value).replace('.', ',')} %`
}

export function MortgageBanner() {
  const family = constructorConfig.mortgage.programs.find((program) => program.id === 'family')
  const rate = family?.rate ?? 6
  const days = promises.estimateDays

  const facts = [
    { value: formatRate(rate), label: 'семейная ипотека' },
    { value: `${days} ${plural(days, ['день', 'дня', 'дней'])}`, label: 'документы для банка' },
    { value: '0 ₽', label: 'предоплаты за стройку' },
  ]

  return (
    <section className="pt-3 lg:pt-4" aria-labelledby="mortgage-banner-title">
      <div className="shell">
        <div className="relative grid overflow-hidden rounded-2xl bg-panel lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          {/* Текст: вертикально по центру панели, как в референсе */}
          <div className="relative z-[1] flex flex-col justify-center px-6 pb-8 pt-7 md:px-10 md:py-11 lg:px-12 lg:py-14">
            <p className="eyebrow mb-4" data-reveal>
              Ипотека и маткапитал
            </p>
            <h2
              id="mortgage-banner-title"
              className="text-pretty"
              data-reveal
              style={{ '--reveal-delay': '60ms' } as React.CSSProperties}
            >
              Дом в ипотеку{' '}
              <span className="block text-ink-soft">от {formatRate(rate)} по семейной программе</span>
            </h2>
            <p
              className="mt-5 max-w-[520px] text-[15px] leading-[1.6] text-ink-soft"
              data-reveal
              style={{ '--reveal-delay': '120ms' } as React.CSSProperties}
            >
              Работаем с семейной и обычной ипотекой на ИЖС, принимаем материнский капитал.{' '}
              <span className="text-ink">Договор подряда и смету в форме банка готовим сами</span> — банк
              видит понятный объект, а вы ничего не платите вперёд.
            </p>

            {/* Три цифры с тонкими разделителями — как строка цифр в первом экране;
                на телефоне — три ровные колонки без палочек */}
            <div
              className="mt-7 grid grid-cols-3 gap-x-3 gap-y-4 sm:flex sm:flex-wrap sm:items-start sm:gap-x-6"
              data-reveal
              style={{ '--reveal-delay': '180ms' } as React.CSSProperties}
            >
              {facts.map((fact, index) => (
                <Fragment key={fact.label}>
                  {index > 0 ? <span aria-hidden className="hidden h-10 w-px shrink-0 bg-black/10 sm:block" /> : null}
                  <div>
                    <div className="num text-[26px] leading-none [font-variant-numeric:normal] md:text-[30px]">
                      {fact.value}
                    </div>
                    <p className="mt-1.5 text-[12.5px] leading-[1.35] muted md:text-[13px]">{fact.label}</p>
                  </div>
                </Fragment>
              ))}
            </div>

            <div
              className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5"
              data-reveal
              style={{ '--reveal-delay': '240ms' } as React.CSSProperties}
            >
              <Button href="/mortgage" arrow className="max-sm:w-full">
                Рассчитать платёж
              </Button>
              <p className="max-w-[260px] text-[13.5px] leading-[1.45] text-ink-soft">
                Или соберите дом в{' '}
                <Link href="/calculator" className="link-underline text-ink">
                  конструкторе
                </Link>{' '}
                — платёж покажем сразу.
              </p>
            </div>
          </div>

          {/* Фото: на десктопе заполняет правую половину панели до её скруглённого
              края, на телефоне встаёт под текстом */}
          <div className="relative min-h-[240px] max-lg:aspect-[16/10] lg:min-h-0">
            <Image
              src="/photos/mortgage-banner.webp"
              alt="Семья с ключами от нового дома на террасе каркасного дома цвета мха"
              width={1600}
              height={1067}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="absolute inset-0 h-full w-full object-cover object-[62%_50%]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
