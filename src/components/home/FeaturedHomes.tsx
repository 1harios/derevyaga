import { Button } from '@/components/ui/Button'
import { FeaturedHomeCard } from './FeaturedHomeCard'
import styles from './FeaturedHomeCard.module.css'
import { cta } from '@/content/company'
import type { Project } from '@/content/projects'
import { formatPrice } from '@/lib/utils'

export function FeaturedHomes({ projects }: { projects: Project[] }) {
  const affordableHomes = [...projects].sort((a, b) => a.priceFrom - b.priceFrom)
  const minimumPrice = affordableHomes[0]?.priceFrom ?? 0
  return (
    <section id="home-projects" className="py-8 md:py-10">
      <div className="shell">
        <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-pretty" data-reveal>
              Проекты домов{' '}
              <span className="block text-ink-soft">от {formatPrice(minimumPrice)}</span>
            </h2>
          </div>

          <Button href="/projects" variant="outline" arrow className="self-start md:self-auto">
            {cta.secondary}
          </Button>
        </div>

        <ul className={styles.grid}>
          {affordableHomes.map((project, index) => (
            <li
              key={project.slug}
              data-reveal
              style={{ '--reveal-delay': `${index * 100}ms` } as React.CSSProperties}
            >
              {/* Сетка стоит под первым экраном: приоритет загрузки оставляем только фото hero */}
              <FeaturedHomeCard project={project} />
            </li>
          ))}
        </ul>

      </div>
    </section>
  )
}



