import { Button } from '@/components/ui/Button'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { cta } from '@/content/company'
import type { Project } from '@/content/projects'
import { formatPrice } from '@/lib/utils'

export function FeaturedHomes({ projects }: { projects: Project[] }) {
  const affordableHomes = [...projects].sort((a, b) => a.priceFrom - b.priceFrom)
  const minimumPrice = affordableHomes[0]?.priceFrom ?? 0
  return (
    <section className="py-8 md:py-10">
      <div className="shell">
        <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-pretty" data-reveal>
              Проекты домов{' '}
              <span className="block text-ink-soft">от {formatPrice(minimumPrice)}</span>
            </h2>
          </div>

          <div className="max-w-sm md:text-right" data-reveal style={{ '--reveal-delay': '90ms' } as React.CSSProperties}>
            <p className="text-[14px] leading-[1.55] text-ink-soft">
              Все проекты — от самой низкой цены. Стоимость актуальна для указанной комплектации и фиксируется в договоре.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 md:justify-end">
              <span className="chip chip--brand">Семейная ипотека</span>
              <span className="chip chip--brand">Маткапитал</span>
            </div>
          </div>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {affordableHomes.map((project, index) => (
            <li
              key={project.slug}
              data-reveal
              style={{ '--reveal-delay': `${index * 100}ms` } as React.CSSProperties}
            >
              {/* Сетка стоит под первым экраном: приоритет загрузки оставляем только фото hero */}
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>

        <div className="mt-5 flex justify-end">
          <Button href="/projects" variant="outline" arrow>
            {cta.secondary}
          </Button>
        </div>
      </div>
    </section>
  )
}
