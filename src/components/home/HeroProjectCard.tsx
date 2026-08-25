'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { projects } from '@/content/projects'

/**
 * Мини-карточка проекта в герое, по референсу: фото с домом в кадре,
 * тег с названием сверху, стеклянный бейдж и золотые звёзды снизу,
 * полупрозрачные круглые стрелки листания справа. Снизу выглядывает
 * следующая карточка — эффект стопки.
 */
export function HeroProjectCard({ className }: { className?: string } = {}) {
  const [index, setIndex] = useState(0)
  const project = projects[index]
  const shift = (delta: number) =>
    setIndex((value) => (value + delta + projects.length) % projects.length)

  return (
    <div className={`relative ${className ?? ''}`} data-reveal>
      <div className="relative h-full overflow-hidden rounded-xl">
        {/* Ключ по проекту: при листании контент перемонтируется
            и проигрывается анимация въезда */}
        <div key={project.slug} className="hero-card-swap h-full">
          <Link href={`/projects/${project.slug}`} className="group/card block h-full">
            <Image
              src={project.photo}
              alt={project.photoAlt}
              width={900}
              height={1350}
              sizes="(min-width: 1024px) 38vw, 92vw"
              className="aspect-[16/8] w-full object-cover object-[50%_58%] transition-transform duration-500 ease-out group-hover/card:scale-[1.03] sm:aspect-[16/7] lg:aspect-auto lg:h-full"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/55 via-black/20 to-transparent"
            />

            {/* Тег проекта — как метка локации в референсе */}
            <span className="absolute top-3 left-3 rounded-full bg-white px-3 py-1.5 font-sans text-[12.5px] font-medium text-[#1b211d]">
              {project.name} · {project.area} м²
            </span>

            {/* Бейдж проекта */}
            <span className="absolute bottom-3 left-3 rounded-full bg-[#436453] px-2.5 py-1 font-sans text-[11.5px] font-medium text-white">
              {project.tag === 'new' ? 'Новинка' : 'Хит'}
            </span>
          </Link>
        </div>

        {/* Полупрозрачные стрелки листания — стекло, как в референсе */}
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
    </div>
  )
}
