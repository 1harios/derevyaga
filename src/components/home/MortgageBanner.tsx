import { Fragment } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { CountUp } from '@/components/ui/CountUp'
import { promises } from '@/content/company'
import { constructorConfig } from '@/lib/constructor/config'
import { plural } from '@/lib/utils'

/**
 * Плашка про ипотеку под первым экраном — два блока в той же сетке, что и
 * первый экран: слева светлая панель с текстом, справа фото семьи с ключами,
 * которое встаёт ровно под фото первого экрана.
 *
 * Анимации: текст проявляется каскадом, фото — с лёгким приближением, цифры
 * докручиваются до значения, пилюля на фото выезжает справа; при наведении
 * фото медленно приближается. При prefers-reduced-motion всё статично.
 * Ставка берётся из конфига конструктора — цифра на главной и в калькуляторе одна.
 */

/** «6 %», «19,6 %» — запятая в дробной части и неразрывный пробел перед знаком */
function formatRate(value: number): string {
  return `${String(value).replace('.', ',')} %`
}

export function MortgageBanner() {
  const family = constructorConfig.mortgage.programs.find((program) => program.id === 'family')
  const rate = family?.rate ?? 6
  const days = promises.estimateDays

  // Число отдельно от подписи к нему: целое докручивается CountUp, дробное показывается как есть
  const facts: { value: number; suffix: string; label: string }[] = [
    { value: rate, suffix: ' %', label: 'семейная ипотека' },
    { value: days, suffix: ` ${plural(days, ['день', 'дня', 'дней'])}`, label: 'документы для банка' },
    { value: 0, suffix: ' ₽', label: 'предоплаты за стройку' },
  ]

  return (
    <section className="pt-3 lg:pt-4" aria-labelledby="mortgage-banner-title">
      <div className="shell">
        {/* Сетка первого экрана: панель 1.15fr, промежуток 16 px, фото 1fr */}
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-4">
          {/* Левая панель — текст, по вертикали по центру */}
          <div className="panel panel--sheen flex flex-col justify-center lg:py-12">
            <h2 id="mortgage-banner-title" className="text-pretty" data-reveal>
              Дом в ипотеку{' '}
              <span className="block text-ink-soft">от {formatRate(rate)} по семейной программе</span>
            </h2>
            <p
              className="mt-5 max-w-[520px] text-[15px] leading-[1.6] text-ink-soft"
              data-reveal
              style={{ '--reveal-delay': '100ms' } as React.CSSProperties}
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
                      {Number.isInteger(fact.value) ? (
                        <CountUp value={fact.value} duration={1100 + index * 250} />
                      ) : (
                        String(fact.value).replace('.', ',')
                      )}
                      <span className="text-ink-faint">{fact.suffix}</span>
                    </div>
                    <p className="mt-1.5 text-[12.5px] leading-[1.35] muted md:text-[13px]">{fact.label}</p>
                  </div>
                </Fragment>
              ))}
            </div>

            <div
              className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5"
              data-reveal
              style={{ '--reveal-delay': '260ms' } as React.CSSProperties}
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

          {/* Правый блок — фото. Проявляется с приближением, при наведении
              медленно приближается ещё немного; на телефоне встаёт под панелью */}
          <div
            className="group relative min-h-[260px] overflow-hidden rounded-2xl max-lg:aspect-[16/10] lg:min-h-0"
            data-reveal="zoom"
            style={{ '--reveal-delay': '120ms' } as React.CSSProperties}
          >
            <Image
              src="/photos/mortgage-banner.webp"
              alt="Семья с ключами от нового дома на террасе каркасного дома цвета мха"
              width={1600}
              height={1067}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="absolute inset-0 h-full w-full object-cover object-[62%_50%] transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
            />
            {/* Пилюля на фото — как пилюли на фото первого экрана; внизу, чтобы
                не спорить с плавающей шапкой, когда блок у верхнего края окна */}
            <div
              className="absolute bottom-4 left-4"
              data-reveal="right"
              style={{ '--reveal-delay': '420ms' } as React.CSSProperties}
            >
              <span className="chip chip--glass shadow-card">
                <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-brand" />
                Семейная ипотека {formatRate(rate)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
