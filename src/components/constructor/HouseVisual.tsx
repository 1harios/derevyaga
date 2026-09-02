'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const SIZES = '(min-width: 1024px) 50vw, 100vw'

/**
 * Дом, который «собирается» по мере выбора: текущий кадр стадии с подписью.
 * На телефоне кадр держит пропорцию 4:3, на десктопе растягивается на всю
 * высоту левой колонки (кадр обрезается по краям, дом в центре остаётся целым).
 * Новый кадр грузится поверх предыдущего и проявляется, когда готов, — дом
 * перестраивается, а не моргает белым. Кадры следующего шага подгружаются
 * скрытыми после того, как загрузился текущий, чтобы не спорить с ним за сеть.
 */
export function HouseVisual({
  src,
  alt,
  caption,
  stepIndex,
  stepsTotal,
  prefetch,
  className,
}: {
  src: string
  alt: string
  caption: string
  stepIndex: number
  stepsTotal: number
  prefetch: string[]
  className?: string
}) {
  // loaded — последний загрузившийся кадр, under — тот, что был на экране до него
  const [frames, setFrames] = useState<{ loaded: string | null; under: string | null }>({
    loaded: null,
    under: null,
  })
  const ready = frames.loaded === src
  // Пока новый кадр грузится, снизу остаётся предыдущий; когда загрузился — тот, поверх которого он проявляется
  const under = frames.loaded !== null && !ready ? frames.loaded : frames.under

  return (
    <figure className={cn('relative overflow-hidden rounded-xl bg-white shadow-card', className)}>
      <div className="relative aspect-[4/3] w-full lg:aspect-auto lg:h-full">
        {under && under !== src ? (
          <Image
            src={under}
            alt=""
            aria-hidden
            width={1200}
            height={900}
            sizes={SIZES}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <Image
          key={src}
          src={src}
          alt={alt}
          width={1200}
          height={900}
          priority
          sizes={SIZES}
          onLoad={() => setFrames((prev) => ({ loaded: src, under: prev.loaded }))}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ease-out',
            frames.loaded !== null && !ready && 'opacity-0',
          )}
        />
      </div>

      <figcaption className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-full bg-white/92 px-4 py-2.5 text-[13px] leading-snug shadow-card backdrop-blur md:inset-x-4 md:bottom-4 md:text-[13.5px]">
        <span className="min-w-0 text-ink">{caption}</span>
        <span className="num shrink-0 text-[12px] text-ink-soft">
          {stepIndex + 1}/{stepsTotal}
        </span>
      </figcaption>

      {/* Предзагрузка кадров следующего шага — после загрузки текущего */}
      {frames.loaded
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
                sizes={SIZES}
                className="hidden"
              />
            ))
        : null}
    </figure>
  )
}
