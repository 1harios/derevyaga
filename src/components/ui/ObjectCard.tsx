'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { BuiltObject } from '@/content/objects'
import { cn, formatPrice, pluralized } from '@/lib/utils'

/**
 * Карточка сданного объекта — минимальная и премиальная: фото 16:10
 * со статус-бейджем и переключателем «Стройка/Сдан», белое тело с одной
 * строкой меты, план-факт срока показан визуальной полоской (зелёная доля —
 * по плану, терракотовая — превышение), цитата владельца в две строки
 * с линией-отбивкой. Честный план-факт — фирменный приём, не прячем.
 * Используется в слайдере на главной и в сетке на странице объектов.
 */
export function ObjectCard({ object }: { object: BuiltObject }) {
  const [showAfter, setShowAfter] = useState(true)
  const diff = object.actualDays - object.plannedDays
  const delayed = diff > 0

  const statusLabel = delayed
    ? `+${pluralized(diff, ['день', 'дня', 'дней'])} к сроку`
    : diff < 0
      ? 'Раньше срока'
      : 'День в день'

  /* Полоска срока: дорожка — большее из чисел, зелёное — в пределах плана,
     терракотовое — превышение. При сдаче раньше срока остаток дорожки пустой. */
  const track = Math.max(object.plannedDays, object.actualDays)
  const greenShare = (Math.min(object.plannedDays, object.actualDays) / track) * 100
  const overShare = delayed ? 100 - greenShare : 0

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-white ring-1 ring-black/[0.05] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(30,37,33,0.12)]">
      {/* Фото с лёгким зумом при наведении */}
      <div className="relative overflow-hidden">
        <Image
          src={showAfter ? object.photoAfter : object.photoBefore}
          alt={showAfter ? object.photoAfterAlt : object.photoBeforeAlt}
          width={1200}
          height={900}
          sizes="(min-width: 1024px) 50vw, 90vw"
          className="aspect-[16/10] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />

        <span
          className={cn(
            'absolute top-3 left-3 rounded-full px-3 py-1.5 font-sans text-[12px] font-medium text-white',
            delayed ? 'bg-warn' : 'bg-brand',
          )}
        >
          {statusLabel}
        </span>

        <div className="absolute right-3 bottom-3 flex gap-1 rounded-full bg-white/95 p-1 shadow-[0_1px_4px_rgba(30,37,33,0.10)]">
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
                'min-h-11 rounded-full px-4 font-sans text-[13px] transition-colors duration-200 ease-out',
                showAfter === value ? 'bg-brand text-white' : 'text-ink hover:bg-black/[0.04]',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        {/* Название и цена в одну строку, мета — второй строкой */}
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-sans text-[17px] leading-snug font-medium text-ink">
            {object.name}
          </h3>
          <span className="shrink-0 font-sans text-[17px] leading-snug font-medium tabular-nums text-ink">
            {formatPrice(object.price)}
          </span>
        </div>
        <p className="mt-1 font-sans text-[13px] text-ink-soft">
          {object.location}, {object.year} · {object.area} м² · {object.completeness}
        </p>

        {/* План-факт срока: подписи и визуальная полоска */}
        <div className="mt-5 mb-5">
          <div className="flex items-baseline justify-between font-sans text-[12.5px]">
            <span className="text-ink-soft">План {object.plannedDays} дн.</span>
            <span className={cn('font-medium', delayed ? 'text-warn' : 'text-brand')}>
              Факт {object.actualDays} дн.
            </span>
          </div>
          <div className="mt-2 flex h-1.5 gap-px overflow-hidden rounded-full bg-line">
            <span className="h-full rounded-full bg-brand" style={{ width: `${greenShare}%` }} />
            {overShare > 0 && (
              <span className="h-full rounded-full bg-warn" style={{ width: `${overShare}%` }} />
            )}
          </div>
          <p className="mt-2 font-sans text-[12.5px] leading-[1.55] text-ink-soft">
            {object.delayNote ??
              `Сдан на ${pluralized(object.plannedDays - object.actualDays, ['день', 'дня', 'дней'])} раньше срока.`}
          </p>
        </div>

        {/* Цитата владельца: компактно, максимум две строки */}
        <blockquote className="mt-auto border-t border-black/[0.06] pt-4 font-sans text-[14px] leading-[1.55] text-ink">
          <span className="line-clamp-2" title={object.quote}>
            «{object.quote}»
          </span>
          <footer className="mt-1.5 text-[12.5px] text-ink-soft">{object.author}</footer>
        </blockquote>
      </div>
    </article>
  )
}
