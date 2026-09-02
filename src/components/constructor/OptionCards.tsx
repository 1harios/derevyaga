'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

export type OptionCard<Id extends string> = {
  id: Id
  label: string
  note?: string
  /** Правая нижняя строка: «в цене», «+ 32 400 ₽», «от 600 000 ₽» */
  price?: string
  thumb?: { src: string; alt: string }
}

/**
 * Карточки выбора: с миниатюрой (кровля, фасад, терраса) или текстовые
 * (размер, утепление). Выбранная — тёмная, как акцентная карточка в референсе.
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
                'group flex min-h-[72px] flex-col overflow-hidden rounded-xl border text-left transition-[border-color,background-color,box-shadow] duration-200 ease-out',
                selected
                  ? 'border-dark bg-dark text-white shadow-card'
                  : 'border-line bg-surface hover:border-ink/40',
              )}
            >
              {option.thumb ? (
                <Image
                  src={option.thumb.src}
                  alt={option.thumb.alt}
                  width={480}
                  height={360}
                  sizes="(min-width: 1024px) 200px, 45vw"
                  className={cn(
                    'aspect-[4/3] w-full object-cover transition-opacity duration-200',
                    selected ? 'opacity-100' : 'opacity-90 group-hover:opacity-100',
                  )}
                />
              ) : null}
              <span className="flex flex-1 flex-col gap-1 p-3.5">
                <span className="font-heading text-[15px] font-medium leading-tight">{option.label}</span>
                {option.note ? (
                  <span className={cn('text-[12.5px] leading-snug', selected ? 'text-white/70' : 'text-ink-soft')}>
                    {option.note}
                  </span>
                ) : null}
                {option.price ? (
                  <span className={cn('mt-auto pt-1 text-[13px] font-medium tabular-nums', selected ? 'text-white' : 'text-ink')}>
                    {option.price}
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
