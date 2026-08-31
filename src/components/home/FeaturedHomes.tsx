import { Button } from '@/components/ui/Button'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { projects } from '@/content/projects'

const affordableHomes = [...projects]
  .sort((a, b) => a.priceFrom - b.priceFrom)
  .slice(0, 2)

export function FeaturedHomes() {
  return (
    <section className="py-10 md:py-14">
      <div className="shell">
        <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-3">Доступные проекты</p>
            <h2 className="text-pretty" data-reveal>
              Большие дома начинаются{' '}
              <span className="block text-ink-soft">с понятной цены</span>
            </h2>
          </div>

          <div className="max-w-sm md:text-right" data-reveal style={{ '--reveal-delay': '90ms' } as React.CSSProperties}>
            <p className="text-[14px] leading-[1.55] text-ink-soft">
              Два самых доступных проекта. Цена актуальна для указанной комплектации и фиксируется в договоре.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 md:justify-end">
              <span className="chip chip--brand">Семейная ипотека</span>
              <span className="chip chip--brand">Маткапитал</span>
            </div>
          </div>
        </div>

        <ul className="grid gap-3 md:grid-cols-2">
          {affordableHomes.map((project, index) => (
            <li
              key={project.slug}
              data-reveal
              style={{ '--reveal-delay': `${index * 100}ms` } as React.CSSProperties}
            >
              <ProjectCard project={project} priority variant="large" />
            </li>
          ))}
        </ul>

        <div className="mt-5 flex justify-end">
          <Button href="/projects" variant="outline" arrow>
            Смотреть все дома
          </Button>
        </div>
      </div>
    </section>
  )
}
