'use client'

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu'
import { Button } from '@/components/ui/Button'
import { FeaturedHomeCard } from './FeaturedHomeCard'
import styles from './ProjectsPreview.module.css'
import { cta } from '@/content/company'
import type { Project } from '@/content/projects'

export function ProjectsPreview({ projects }: { projects: Project[] }) {
  const trackRef = useRef<HTMLUListElement>(null)
  const dragRef = useRef({ active: false, pointerId: -1, startX: 0, startScrollLeft: 0, moved: false })
  const suppressClickRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)
  const hits = projects.filter((project) => project.tag === 'hit')
  const [edges, setEdges] = useState({ start: true, end: false })

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const updateEdges = () => setEdges({
      start: track.scrollLeft <= 1,
      end: track.scrollLeft >= track.scrollWidth - track.clientWidth - 1,
    })
    const observer = new ResizeObserver(updateEdges)
    observer.observe(track)
    track.addEventListener('scroll', updateEdges, { passive: true })
    updateEdges()
    return () => {
      observer.disconnect()
      track.removeEventListener('scroll', updateEdges)
    }
  }, [hits.length])

  const scrollBehavior = (): ScrollBehavior => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'

  const scrollBy = (direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    const cards = Array.from(track.children) as HTMLElement[]
    const step = cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth * 0.6
    track.scrollTo({ left: (Math.round(track.scrollLeft / step) + direction) * step, behavior: scrollBehavior() })
  }

  const snapToNearestCard = () => {
    const track = trackRef.current
    if (!track) return
    const cards = Array.from(track.children) as HTMLElement[]
    const step = cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : 0
    if (!step) return
    track.scrollTo({ left: Math.round(track.scrollLeft / step) * step, behavior: scrollBehavior() })
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

  if (!hits.length) return null

  // Панель поднята слоем выше: она накрывает низ конструкции из блока
  // технологии — так же, как в референсе
  return (
    <section id="projects" className="relative z-10 py-8 md:py-12">
      <div className="shell">
        <div className={`panel ${styles.panel}`}>
          <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <h2 data-reveal>
              Хит продаж{' '}
              <span className="block text-ink-soft">2026 года</span>
            </h2>
            <p className="hidden max-w-xs text-[15px] leading-[1.5] md:block" data-reveal style={{ '--reveal-delay': '100ms' } as React.CSSProperties}>
              Дома, которые выбирают наши клиенты.{' '}
              <span className="muted">Популярные проекты с удобными планировками — найдите свой вариант.</span>
            </p>
          </div>

          {/* Нативная горизонтальная лента: свайп на телефоне, тачпад и
              перетаскивание мышью на компьютере. */}
          <div className="lg:-mx-1 lg:overflow-hidden lg:px-1">
            <ul
              ref={trackRef}
              id="hit-projects-track"
              aria-label="Хиты продаж"
              onPointerDown={startDragging}
              onPointerMove={moveDragging}
              onPointerUp={stopDragging}
              onPointerCancel={stopDragging}
              onClickCapture={preventCardClickAfterDrag}
              onDragStart={(event) => event.preventDefault()}
              className={`${styles.track} ${
                isDragging ? 'cursor-grabbing snap-none select-none' : 'cursor-grab snap-x snap-mandatory'
              }`}
            >
              {hits.map((project) => (
              <li
                key={project.slug}
                className="snap-start"
              >
                <FeaturedHomeCard project={project} />
              </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <Button href="/projects" arrow>
              {cta.secondary}
            </Button>

            <div className={`flex gap-2 ${edges.start && edges.end ? 'hidden' : ''}`}>
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                aria-label="Предыдущий проект"
                aria-controls="hit-projects-track"
                disabled={edges.start}
                className={`icon-btn catalog-nav-btn catalog-nav-btn--prev ${styles.navButton}`}
              >
                <LuArrowLeft aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                aria-label="Следующий проект"
                aria-controls="hit-projects-track"
                disabled={edges.end}
                className={`icon-btn catalog-nav-btn catalog-nav-btn--next ${styles.navButton}`}
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
