import { complectations } from '@/content/complectations'
import { formatNumber } from '@/lib/utils'
import { Button } from './Button'
import { Tag } from './Tag'
import { cn } from '@/lib/utils'

/** Три комплектации: средняя — тёмная, как акцентная карточка в референсе */
export function ComplectationColumns() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {complectations.map((item) => {
        const accent = Boolean(item.recommended)

        return (
          <div
            key={item.id}
            className={cn(
              'flex flex-col rounded-xl p-6 md:p-7',
              accent ? 'on-dark bg-dark text-white' : 'card',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[20px]">{item.name}</h3>
              {accent ? <Tag className="bg-white/12 text-white">Чаще всего берут</Tag> : null}
            </div>

            <p className="muted mt-3 text-[15px] leading-[1.55]">
              {item.summary}
            </p>

            <div className={cn('mt-6 border-t pt-5', accent ? 'border-white/12' : 'border-line')}>
              <div className="muted text-[13px]">Цена за м²</div>
              <div className="num mt-1 text-[clamp(1.6rem,1.3rem+1vw,2rem)]">
                от {formatNumber(item.pricePerM2)} ₽
              </div>
            </div>

            <ul className="mt-6 space-y-2.5 text-[14px] leading-[1.5]">
              {item.includes.map((line) => (
                <li key={line} className="flex gap-3">
                  <span
                    aria-hidden
                    className={cn(
                      'mt-1.5 size-1.5 shrink-0 rounded-full',
                      accent ? 'bg-white/70' : 'bg-brand',
                    )}
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <div className={cn('mt-6 border-t pt-5', accent ? 'border-white/12' : 'border-line')}>
              <div className="muted mb-3 text-[13px]">Не входит</div>
              <ul className="muted space-y-1.5 text-[14px] leading-[1.5]">
                {item.excludes.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span
                      aria-hidden
                      className={cn(
                        'mt-2.5 h-px w-3 shrink-0',
                        accent ? 'bg-white/30' : 'bg-line',
                      )}
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto pt-7">
              <Button
                href="/complectations"
                variant={accent ? 'light' : 'outline'}
                wide
                arrow
              >
                Сравнить подробно
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
