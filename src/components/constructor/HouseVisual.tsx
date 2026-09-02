'use client'

import Image from 'next/image'
import { useState } from 'react'

/**
 * Дом, который «собирается» по мере выбора: текущий кадр стадии с подписью.
 * Кадр меняется по key — новая картинка мягко проявляется (класс constructor-fade).
 * Картинки следующего шага подгружаются скрытыми, но только после того, как
 * загрузился текущий кадр — чтобы не конкурировать с ним за сеть на первом экране.
 */
export function HouseVisual({
  src,
  alt,
  caption,
  stepIndex,
  stepsTotal,
  prefetch,
}: {
  src: string
  alt: string
  caption: string
  stepIndex: number
  stepsTotal: number
  prefetch: string[]
}) {
  const [firstLoaded, setFirstLoaded] = useState(false)

  return (
    <figure className="relative overflow-hidden rounded-xl bg-white shadow-card">
      <Image
        key={src}
        src={src}
        alt={alt}
        width={1200}
        height={900}
        priority
        sizes="(min-width: 1024px) 50vw, 100vw"
        onLoad={() => setFirstLoaded(true)}
        className="constructor-fade aspect-[4/3] w-full object-cover"
      />

      <figcaption className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-full bg-white/92 px-4 py-2.5 text-[13px] leading-snug shadow-card backdrop-blur md:inset-x-4 md:bottom-4 md:text-[13.5px]">
        <span className="min-w-0 text-ink">{caption}</span>
        <span className="num shrink-0 text-[12px] text-ink-soft">
          {stepIndex + 1}/{stepsTotal}
        </span>
      </figcaption>

      {/* Предзагрузка кадров следующего шага — после загрузки текущего */}
      {firstLoaded
        ? prefetch
            .filter((item) => item !== src)
            .map((item) => (
              <Image
                key={item}
                src={item}
                alt=""
                width={1200}
                height={900}
                loading="eager"
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="hidden"
              />
            ))
        : null}
    </figure>
  )
}
