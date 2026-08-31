'use client'

import { useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu'
import { Button } from '@/components/ui/Button'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { projects } from '@/content/projects'

export function ProjectsPreview() {
  const trackRef = useRef<HTMLUListElement>(null)
  const dragRef = useRef({ active: false, pointerId: -1, startX: 0, startScrollLeft: 0, moved: false })
  const suppressClickRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)

  const scrollBy = (direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    const cards = Array.from(track.children) as HTMLElement[]
    const step = cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth * 0.6
    track.scrollBy({ left: direction * step, behavior: 'smooth' })
  }

  const snapToNearestCard = () => {
    const track = trackRef.current
    if (!track) return
    const cards = Array.from(track.children) as HTMLElement[]
    const step = cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : 0
    if (!step) return
    track.scrollTo({ left: Math.round(track.scrollLeft / step) * step, behavior: 'smooth' })
  }

  const startDragging = (event: ReactPointerEvent<HTMLUListElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: event.currentTarget.scrollLeft,
      moved: false,
    }
  }

  const moveDragging = (event: ReactPointerEvent<HTMLUListElement>) => {
    const drag = dragRef.current
    if (!drag.active || event.pointerId !== drag.pointerId) return
    const distance = event.clientX - drag.startX
    if (Math.abs(distance) > 4 && !drag.moved) {
      drag.moved = true
      event.currentTarget.setPointerCapture(event.pointerId)
      setIsDragging(true)
    }
    if (!drag.moved) return
    event.preventDefault()
    event.currentTarget.scrollLeft = drag.startScrollLeft - distance
  }

  const stopDragging = (event: ReactPointerEvent<HTMLUListElement>) => {
    const drag = dragRef.current
    if (!drag.active || event.pointerId !== drag.pointerId) return
    drag.active = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setIsDragging(false)

    if (drag.moved) {
      suppressClickRef.current = true
      window.setTimeout(() => {
        suppressClickRef.current = false
      }, 120)
      requestAnimationFrame(snapToNearestCard)
    }
  }

  const preventCardClickAfterDrag = (event: ReactMouseEvent<HTMLUListElement>) => {
    if (!suppressClickRef.current) return
    event.preventDefault()
    event.stopPropagation()
  }

  // Панель поднята слоем выше: она накрывает низ конструкции из блока
  // технологии — так же, как в референсе
  return (
    <section id="projects" className="relative z-10 py-8 md:py-12">
      <div className="shell">
        <div className="panel">
          <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <h2 data-reveal>
              Каталог наших{' '}
              <span className="block text-ink-soft">объектов за 2025 год</span>
            </h2>
            <p className="max-w-xs text-[15px] leading-[1.5]" data-reveal style={{ '--reveal-delay': '100ms' } as React.CSSProperties}>
              По каждому проекту есть сданный дом, смета и срок из договора.{' '}
              <span className="muted">Планировку меняем под вас и пересчитываем до подписания.</span>
            </p>
          </div>

          {/* Нативная горизонтальная лента: свайп на телефоне, тачпад и
              перетаскивание мышью на компьютере. */}
          <div className="lg:-mx-1 lg:overflow-hidden lg:px-1">
            <ul
              ref={trackRef}
              onPointerDown={startDragging}
              onPointerMove={moveDragging}
              onPointerUp={stopDragging}
              onPointerCancel={stopDragging}
              onClickCapture={preventCardClickAfterDrag}
              onDragStart={(event) => event.preventDefault()}
              className={`-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden ${
                isDragging ? 'cursor-grabbing snap-none select-none' : 'cursor-grab snap-x snap-mandatory'
              }`}
            >
              {projects.map((project, index) => (
              <li
                key={project.slug}
                data-reveal
                style={{ '--reveal-delay': `${index * 90}ms` } as React.CSSProperties}
                className="w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-[calc(25%-9px)]"
              >
                <ProjectCard project={project} priority={index < 2} />
              </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <Button href="/projects" arrow>
              В каталог
            </Button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                aria-label="Предыдущие проекты"
                className="icon-btn catalog-nav-btn catalog-nav-btn--prev"
              >
                <LuArrowLeft aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                aria-label="Следующие проекты"
                className="icon-btn catalog-nav-btn catalog-nav-btn--next"
              >
                <LuArrowRight aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
