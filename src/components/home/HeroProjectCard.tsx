'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { projects } from '@/content/projects'
import { formatPrice } from '@/lib/utils'

/**
 * Мини-карточка проекта в левой колонке героя (по референсу): фото,
 * тег с названием и площадью, бейдж и цена, справа — круглые стрелки,
 * листающие проекты каталога без перехода со страницы.
 */
export function HeroProjectCard() {
  const [index, setIndex] = useState(0)
  const project = projects[index]
  const shift = (delta: number) =>
    setIndex((value) => (value + delta + projects.length) % projects.length)

  return (
    <div className="relative overflow-hidden rounded-2xl" data-reveal>
      <Link href={`/projects/${project.slug}`} className="group/card block">
        <Image
          key={project.slug}
          src={project.photo}
          alt={project.photoAlt}
          width={900}
          height={1350}
          sizes="(min-width: 1024px) 38vw, 92vw"
          className="aspect-[16/8] w-full object-cover object-[50%_62%] transition-transform duration-500 ease-out group-hover/card:scale-[1.03] sm:aspect-[16/7]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/60 via-black/25 to-transparent"
        />

        {/* Тег проекта — как метка локации в референсе */}
        <span className="absolute top-3 left-3 rounded-full bg-white px-3 py-1.5 font-sans text-[12.5px] font-medium text-[#1b211d]">
          {project.name} · {project.area} м²
        </span>

        <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2">
          {project.tag ? (
            <span className="rounded-full bg-[#436453] px-2.5 py-1 font-sans text-[11.5px] font-medium text-white">
              {project.tag === 'hit' ? 'Хит' : 'Новинка'}
            </span>
          ) : null}
          <span className="font-sans text-[13px] font-medium text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.4)]">
            от {formatPrice(project.priceFrom)} · {project.days} дней
          </span>
        </div>
      </Link>

      {/* Стрелки листания — вертикально у правого края, как в референсе */}
      <div className="absolute top-1/2 right-3 flex -translate-y-1/2 flex-col gap-1.5">
        <button
          type="button"
          onClick={() => shift(-1)}
          aria-label="Предыдущий проект"
          className="grid size-9 place-items-center rounded-full bg-white/95 text-[#1b211d] shadow-[0_1px_4px_rgba(30,37,33,0.15)] transition-colors duration-200 hover:bg-white"
        >
          <svg viewBox="0 0 14 14" aria-hidden className="size-3.5">
            <path d="M7 11V3M3.5 6.5 7 3l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => shift(1)}
          aria-label="Следующий проект"
          className="grid size-9 place-items-center rounded-full bg-white/95 text-[#1b211d] shadow-[0_1px_4px_rgba(30,37,33,0.15)] transition-colors duration-200 hover:bg-white"
        >
          <svg viewBox="0 0 14 14" aria-hidden className="size-3.5">
            <path d="M7 3v8M3.5 7.5 7 11l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
