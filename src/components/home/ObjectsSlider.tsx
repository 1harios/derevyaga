'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { ObjectCard } from '@/components/ui/ObjectCard'
import { Section, SectionHeader } from '@/components/ui/Section'
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
      <SectionHeader
        eyebrow="Построенные объекты"
        title="Что получилось на самом деле"
        description={
          <>
            План-факт по срокам показываем <strong>как есть, включая задержки</strong>. Каждый
            владелец согласился, что с ним можно связаться и спросить про стройку.
          </>
        }
        action={
          <div className="flex gap-2">
            <button type="button" onClick={() => scrollBy(-1)} aria-label="Предыдущий объект" className="icon-btn">
              ←
            </button>
            <button type="button" onClick={() => scrollBy(1)} aria-label="Следующий объект" className="icon-btn">
              →
            </button>
          </div>
        }
      />

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
