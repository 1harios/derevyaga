'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { ObjectCard } from '@/components/ui/ObjectCard'
import { Section } from '@/components/ui/Section'
import { builtObjects } from '@/content/objects'

export function ObjectsSlider() {
  const trackRef = useRef<HTMLUListElement>(null)

  const scrollBy = (direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: 'smooth' })
  }

  return (
    <Section id="objects">
      {/* Шапка в фирменном стиле: двухцветный заголовок слева,
          справа узкая двухцветная подпись и стрелки слайдера */}
      <div className="mb-7 flex flex-col gap-5 md:mb-9 md:flex-row md:items-end md:justify-between">
        <h2 className="text-pretty" data-reveal>
          Что получилось{' '}
          <span className="block text-ink-soft">на самом деле</span>
        </h2>
        <div className="flex items-end justify-between gap-6 md:justify-end">
          <p
            className="max-w-xs text-[15px] leading-[1.5]"
            data-reveal
            style={{ '--reveal-delay': '100ms' } as React.CSSProperties}
          >
            План-факт по срокам показываем как есть, включая задержки.{' '}
            <span className="muted">
              Каждый владелец согласился, что с ним можно связаться и спросить про стройку.
            </span>
          </p>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => scrollBy(-1)} aria-label="Предыдущий объект" className="icon-btn">
              ←
            </button>
            <button type="button" onClick={() => scrollBy(1)} aria-label="Следующий объект" className="icon-btn">
              →
            </button>
          </div>
        </div>
      </div>

      <ul
        ref={trackRef}
        className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {builtObjects.map((object) => (
          <li
            key={object.slug}
            className="w-[86%] shrink-0 snap-start sm:w-[68%] lg:w-[calc(50%-6px)]"
          >
            <ObjectCard object={object} />
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <Button href="/objects" variant="outline" arrow>
          Все объекты
        </Button>
      </div>
    </Section>
  )
}
