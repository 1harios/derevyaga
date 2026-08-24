'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { BuiltObject } from '@/content/objects'
import { cn, formatPrice, pluralized } from '@/lib/utils'

/**
 * Карточка сданного объекта: переключатель «стройка/сдан», план-факт срока
 * с честной пометкой о задержке и цитата владельца. Используется в слайдере
 * на главной и в сетке на странице объектов.
 */
export function ObjectCard({ object }: { object: BuiltObject }) {
  const [showAfter, setShowAfter] = useState(true)
  const delayed = object.actualDays > object.plannedDays

  return (
    <article className="card h-full overflow-hidden rounded-xl">
      <div className="relative p-2">
        <Image
          src={showAfter ? object.photoAfter : object.photoBefore}
          alt={showAfter ? object.photoAfterAlt : object.photoBeforeAlt}
          width={1200}
          height={900}
          sizes="(min-width: 1024px) 50vw, 90vw"
          className="aspect-[4/3] w-full rounded-lg object-cover"
        />
        <div className="absolute bottom-5 left-5 flex gap-1 rounded-full bg-white/90 p-1">
          {(
            [
              ['Стройка', false],
              ['Сдан', true],
            ] as const
          ).map(([label, value]) => (
            <button
              key={label}
              type="button"
              onClick={() => setShowAfter(value)}
              aria-pressed={showAfter === value}
              className={cn(
                'min-h-9 rounded-full px-4 text-[13px] transition-colors duration-200 ease-out',
                showAfter === value ? 'bg-dark text-white' : 'text-ink',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 pt-3 md:p-6 md:pt-4">
        <div className="flex items-baseline justify-between gap-4">
          <h3>{object.name}</h3>
          <span className="text-[14px] muted">
            {object.location}, {object.year}
          </span>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-y border-line py-4 text-[15px] sm:grid-cols-4">
          <div>
            <dt className="text-[13px] muted">Площадь</dt>
            <dd className="tabular-nums">{object.area} м²</dd>
          </div>
          <div>
            <dt className="text-[13px] muted">Комплектация</dt>
            <dd>{object.completeness}</dd>
          </div>
          <div>
            <dt className="text-[13px] muted">План / факт</dt>
            <dd className={cn('tabular-nums', delayed ? 'text-err' : 'text-ok')}>
              {object.plannedDays} / {object.actualDays} дн.
            </dd>
          </div>
          <div>
            <dt className="text-[13px] muted">Стоимость</dt>
            <dd className="tabular-nums">{formatPrice(object.price)}</dd>
          </div>
        </dl>

        <p className="mt-4 rounded-md bg-panel p-4 text-[14px] leading-[1.55] muted">
          {object.delayNote ??
            `Сдан на ${pluralized(object.plannedDays - object.actualDays, ['день', 'дня', 'дней'])} раньше срока.`}
        </p>

        <blockquote className="mt-4 text-[15px] leading-[1.6]">
          «{object.quote}»
          <footer className="mt-2 text-[14px] muted">{object.author}</footer>
        </blockquote>
      </div>
    </article>
  )
}
