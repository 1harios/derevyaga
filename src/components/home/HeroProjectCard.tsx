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
const STARS = [0, 1, 2, 3, 4]

export function HeroProjectCard({ className }: { className?: string } = {}) {
  const [index, setIndex] = useState(0)
  const project = projects[index]
  const next = projects[(index + 1) % projects.length]
  const shift = (delta: number) =>
    setIndex((value) => (value + delta + projects.length) % projects.length)

  return (
    <div className={`relative ${className ?? ''}`} data-reveal>
      {/* Стопка: следующая карточка выглядывает из-под текущей */}
      <div aria-hidden className="absolute inset-x-3 top-6 -bottom-2 -z-10 overflow-hidden rounded-2xl">
        <Image
          key={next.slug}
          src={next.photo}
          alt=""
          width={900}
          height={1350}
          sizes="30vw"
          className="h-full w-full object-cover object-[50%_58%] brightness-[0.85] blur-[1px]"
        />
      </div>

      <div className="relative h-full overflow-hidden rounded-2xl">
        <Link href={`/projects/${project.slug}`} className="group/card block h-full">
          <Image
            key={project.slug}
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

          {/* Стеклянный бейдж и золотые звёзды, как в референсе */}
          <div className="absolute bottom-3 left-3 flex flex-col items-start gap-1.5">
            <span className="rounded-full border border-white/70 bg-white/15 px-3 py-1 font-sans text-[11.5px] font-medium text-white backdrop-blur-md">
              {project.tag === 'new' ? 'Новинка' : 'Хит'}
            </span>
            <span className="flex gap-0.5">
              {STARS.map((star) => (
                <svg key={star} viewBox="0 0 14 14" aria-hidden className="size-3.5">
                  <path
                    d="M7 1.1l1.75 3.6 3.95.55-2.88 2.77.7 3.93L7 10.1l-3.52 1.85.7-3.93L1.3 5.25l3.95-.55L7 1.1Z"
                    fill="#f5b825"
                  />
                </svg>
              ))}
            </span>
          </div>
        </Link>

        {/* Полупрозрачные стрелки листания — стекло, как в референсе */}
        <div className="absolute top-1/2 right-3 flex -translate-y-1/2 flex-col gap-1.5">
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Предыдущий проект"
            className="grid size-9 place-items-center rounded-full bg-black/20 text-white ring-1 ring-white/35 backdrop-blur-md transition-colors duration-200 hover:bg-black/35"
          >
            <svg viewBox="0 0 14 14" aria-hidden className="size-3.5">
              <path d="M7 11V3M3.5 6.5 7 3l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            aria-label="Следующий проект"
            className="grid size-9 place-items-center rounded-full bg-black/20 text-white ring-1 ring-white/35 backdrop-blur-md transition-colors duration-200 hover:bg-black/35"
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
