'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { BuiltObject } from '@/content/objects'
import { cn, formatPrice, pluralized } from '@/lib/utils'

/**
 * Карточка сданного объекта в фирменном стиле: фото во всю ширину карточки
 * с переключателем «Стройка/Сдан» (активная вкладка — фирменный зелёный),
 * статус срока цветным бейджем на фото, характеристики — белыми чипами,
 * цитата владельца — в белом скруглённом блоке. Честный план-факт сохранён:
 * задержка не прячется, а выносится в бейдж и пояснение.
 * Используется в слайдере на главной и в сетке на странице объектов.
 */
export function ObjectCard({ object }: { object: BuiltObject }) {
  const [showAfter, setShowAfter] = useState(true)
  const diff = object.actualDays - object.plannedDays
  const delayed = diff > 0

  const statusLabel = delayed
    ? `+${diff} ${pluralized(diff, ['день', 'дня', 'дней'])} к сроку`
    : diff < 0
      ? 'Раньше срока'
      : 'День в день'

  const chips = [
    `${object.area} м²`,
    object.completeness,
    formatPrice(object.price),
    `План ${object.plannedDays} / факт ${object.actualDays} дн.`,
  ]

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-[#f0efed] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(30,37,33,0.10)]">
      {/* Фото во всю ширину карточки, лёгкий зум при наведении */}
      <div className="relative overflow-hidden">
        <Image
          src={showAfter ? object.photoAfter : object.photoBefore}
          alt={showAfter ? object.photoAfterAlt : object.photoBeforeAlt}
          width={1200}
          height={900}
          sizes="(min-width: 1024px) 50vw, 90vw"
          className="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />

        {/* Статус срока: честный бейдж — зелёный в срок, терракотовый при задержке */}
        <span
          className={cn(
            'absolute top-3 right-3 rounded-full px-3 py-1.5 font-sans text-[12px] font-medium text-white',
            delayed ? 'bg-[#8a4b38]' : 'bg-[#436453]',
          )}
        >
          {statusLabel}
        </span>

        {/* Переключатель «стройка/сдан»: активная вкладка — фирменный зелёный */}
        <div className="absolute bottom-3 left-3 flex gap-1 rounded-full bg-white/95 p-1 shadow-[0_1px_4px_rgba(30,37,33,0.10)]">
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
                'min-h-8 rounded-full px-3.5 font-sans text-[13px] transition-colors duration-200 ease-out',
                showAfter === value ? 'bg-[#436453] text-white' : 'text-[#1b211d] hover:bg-black/[0.04]',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="font-sans text-[17px] font-medium text-[#1b211d]">{object.name}</h3>
          <span className="font-sans text-[13px] text-[#6a6a6a]">
            {object.location}, {object.year}
          </span>
        </div>

        {/* Характеристики — белыми чипами вместо таблицы */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full bg-white px-3 py-1.5 font-sans text-[13px] text-[#1b211d] tabular-nums"
            >
              {chip}
            </span>
          ))}
        </div>

        <p className="mt-3 font-sans text-[13px] leading-[1.55] text-[#6a6a6a]">
          {object.delayNote ??
            `Сдан на ${pluralized(object.plannedDays - object.actualDays, ['день', 'дня', 'дней'])} раньше срока.`}
        </p>

        {/* Цитата владельца — белый скруглённый блок */}
        <blockquote className="mt-4 rounded-lg bg-white p-4 text-[14px] leading-[1.6] text-[#1b211d] md:p-5">
          «{object.quote}»
          <footer className="mt-2 font-sans text-[13px] text-[#6a6a6a]">{object.author}</footer>
        </blockquote>
      </div>
    </article>
  )
}
