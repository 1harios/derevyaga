'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

export type OptionCard<Id extends string> = {
  id: Id
  label: string
  note?: string
  /** Нижняя строка: «в цене», «+ 32 400 ₽», «от 600 000 ₽» */
  price?: string
  /** Приписка к цене: платёж по семейной ипотеке, например «+ 135 ₽/мес» */
  priceNote?: string
  thumb?: { src: string; alt: string }
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="size-3.5">
      <path
        d="m3.5 8.5 3 3 6-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Карточки выбора. Плитки — миниатюра сверху, текст снизу (кровля, фасад, терраса,
 * сваи); строки — иконка слева, текст справа (размеры: шесть вариантов помещаются
 * в один экран). Выбранная — тёмная, как акцентная карточка в референсе, с галочкой
 * на миниатюре; у цены — платёж в месяц по семейной ипотеке.
 */
export function OptionCards<Id extends string>({
  label,
  value,
  onChange,
  options,
  columns = 3,
  variant = 'tile',
}: {
  label: string
  value: Id
  onChange: (id: Id) => void
  options: ReadonlyArray<OptionCard<Id>>
  columns?: 2 | 3
  variant?: 'tile' | 'row'
}) {
  const row = variant === 'row'
  return (
    <fieldset className="min-w-0">
      {/* На десктопе подпись группы дублирует заголовок шага — оставляем её только скринридерам */}
      <legend className="field-label mb-3 lg:sr-only">{label}</legend>
      <div
        className={cn(
          'grid gap-2',
          row ? 'sm:grid-cols-2' : columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3',
        )}
      >
        {options.map((option) => {
          const selected = option.id === value
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.id)}
              className={cn(
                'group overflow-hidden rounded-xl border text-left transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5',
                row ? 'grid grid-cols-[56px_minmax(0,1fr)] items-center gap-2.5 p-1.5 pr-3' : 'flex min-h-[72px] flex-col',
                selected
                  ? 'border-dark bg-dark text-white shadow-card'
                  : 'border-line bg-surface hover:border-ink/40 hover:shadow-card',
              )}
            >
              {option.thumb ? (
                <span className={cn('relative block overflow-hidden bg-white', row && 'rounded-lg')}>
                  <Image
                    src={option.thumb.src}
                    alt={option.thumb.alt}
                    width={480}
                    height={360}
                    sizes={row ? '56px' : '(min-width: 1024px) 200px, 45vw'}
                    className={cn(
                      'w-full object-cover transition-[opacity,transform] duration-300',
                      // Плитки на десктопе чуть ниже (16:10), чтобы шаг помещался в экран без прокрутки
                      row ? 'aspect-[4/3]' : 'aspect-[4/3] lg:aspect-[16/10]',
                      selected ? 'opacity-100' : 'opacity-90 group-hover:scale-[1.03] group-hover:opacity-100',
                    )}
                  />
                  {selected ? (
                    <span
                      className={cn(
                        'absolute grid place-items-center rounded-full bg-dark text-white shadow-card',
                        row ? 'top-1.5 left-1.5 size-5' : 'top-2.5 left-2.5 size-6',
                      )}
                    >
                      <CheckIcon />
                    </span>
                  ) : null}
                </span>
              ) : null}
              <span className={cn('flex flex-1 flex-col', row ? 'min-w-0 gap-0.5 py-0.5' : 'gap-1 p-3')}>
                {/* Длинные названия («Металлочерепица») на узкой карточке переносятся по слогам */}
                <span className="font-heading text-[14px] leading-tight font-medium break-words hyphens-auto sm:text-[15px]">
                  {option.label}
                </span>
                {option.note ? (
                  <span
                    className={cn(
                      'leading-snug',
                      row ? 'truncate text-[12px]' : 'text-[12.5px] lg:line-clamp-2',
                      selected ? 'text-white/70' : 'text-ink-soft',
                    )}
                  >
                    {option.note}
                  </span>
                ) : null}
                {option.price ? (
                  <span className={cn('flex flex-wrap items-baseline gap-x-2', row ? '' : 'mt-auto pt-1')}>
                    <span className={cn('text-[13px] font-medium tabular-nums', selected ? 'text-white' : 'text-ink')}>
                      {option.price}
                    </span>
                    {option.priceNote ? (
                      <span
                        className={cn(
                          'tabular-nums whitespace-nowrap',
                          row ? 'text-[11px]' : 'text-[11.5px]',
                          selected ? 'text-white/60' : 'text-ink-soft',
                        )}
                      >
                        {option.priceNote}
                      </span>
                    ) : null}
                  </span>
                ) : null}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
