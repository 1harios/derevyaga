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
 * Карточки выбора: с миниатюрой (размер, сваи, кровля, фасад, терраса) или
 * текстовые (утепление). Выбранная — тёмная, как акцентная карточка в референсе,
 * с галочкой на миниатюре; у цены — платёж в месяц по семейной ипотеке.
 */
export function OptionCards<Id extends string>({
  label,
  value,
  onChange,
  options,
  columns = 3,
}: {
  label: string
  value: Id
  onChange: (id: Id) => void
  options: ReadonlyArray<OptionCard<Id>>
  columns?: 2 | 3
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="field-label mb-3">{label}</legend>
      <div className={cn('grid gap-2', columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3')}>
        {options.map((option) => {
          const selected = option.id === value
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.id)}
              className={cn(
                'group flex min-h-[72px] flex-col overflow-hidden rounded-xl border text-left transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5',
                selected
                  ? 'border-dark bg-dark text-white shadow-card'
                  : 'border-line bg-surface hover:border-ink/40 hover:shadow-card',
              )}
            >
              {option.thumb ? (
                <span className="relative block bg-white">
                  <Image
                    src={option.thumb.src}
                    alt={option.thumb.alt}
                    width={480}
                    height={360}
                    sizes="(min-width: 1024px) 200px, 45vw"
                    className={cn(
                      'aspect-[4/3] w-full object-cover transition-[opacity,transform] duration-300',
                      selected ? 'opacity-100' : 'opacity-90 group-hover:scale-[1.03] group-hover:opacity-100',
                    )}
                  />
                  {selected ? (
                    <span className="absolute top-2.5 left-2.5 grid size-6 place-items-center rounded-full bg-dark text-white shadow-card">
                      <CheckIcon />
                    </span>
                  ) : null}
                </span>
              ) : null}
              <span className="flex flex-1 flex-col gap-1 p-3.5">
                <span className="font-heading text-[15px] leading-tight font-medium">{option.label}</span>
                {option.note ? (
                  <span className={cn('text-[12.5px] leading-snug', selected ? 'text-white/70' : 'text-ink-soft')}>
                    {option.note}
                  </span>
                ) : null}
                {option.price ? (
                  <span className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1">
                    <span className={cn('text-[13px] font-medium tabular-nums', selected ? 'text-white' : 'text-ink')}>
                      {option.price}
                    </span>
                    {option.priceNote ? (
                      <span className={cn('text-[11.5px] tabular-nums', selected ? 'text-white/60' : 'text-ink-soft')}>
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
