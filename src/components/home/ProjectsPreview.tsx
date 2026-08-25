'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { projects } from '@/content/projects'

export function ProjectsPreview() {
  const trackRef = useRef<HTMLUListElement>(null)
  /* Сдвиг ленты на десктопе. Лента там вообще не скролл-контейнер —
     двигается только transform'ом по стрелкам, поэтому колесо, тачпад,
     drag-выделение и восстановление позиции после перезагрузки не могут
     сдвинуть карточки ни в какой момент. На телефоне остаётся обычный свайп. */
  const [shiftPx, setShiftPx] = useState(0)

  const scrollBy = (direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    const step = direction * track.clientWidth * 0.6

    if (window.innerWidth < 1024) {
      track.scrollBy({ left: step, behavior: 'smooth' })
      return
    }

    const max = track.scrollWidth - track.clientWidth
    setShiftPx((current) => Math.max(0, Math.min(current + step, max)))
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
            {/* Двухцветная подпись, как в референсе: первая фраза тёмная, вторая приглушённая */}
            <p className="max-w-xs text-[15px] leading-[1.5]" data-reveal style={{ '--reveal-delay': '100ms' } as React.CSSProperties}>
              По каждому проекту есть сданный дом, смета и срок из договора.{' '}
              <span className="muted">Планировку меняем под вас и пересчитываем до подписания.</span>
            </p>
          </div>

          {/* Обёртка клипует ленту на десктопе, где она двигается transform'ом */}
          <div className="lg:-mx-1 lg:overflow-hidden lg:px-1">
            <ul
              ref={trackRef}
              style={{ '--catalog-shift': `${-shiftPx}px` } as React.CSSProperties}
              className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] lg:mx-0 lg:translate-x-[var(--catalog-shift)] lg:snap-none lg:overflow-visible lg:px-0 lg:transition-transform lg:duration-500 lg:ease-out [&::-webkit-scrollbar]:hidden"
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
                className="icon-btn"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                aria-label="Следующие проекты"
                className="icon-btn"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
