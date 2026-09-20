import Image from 'next/image'
import Link from 'next/link'
import { LuBedDouble, LuClock3, LuMaximize2 } from 'react-icons/lu'
import { ArrowIcon } from '@/components/ui/Button'
import type { Project } from '@/content/projects'
import { formatPrice, pluralized } from '@/lib/utils'
import styles from './FeaturedHomeCard.module.css'

export function FeaturedHomeCard({ project, priority }: { project: Project; priority?: boolean }) {
  return <article className={styles.card}>
    <Link href={`/projects/${project.slug}`} className={styles.link} aria-label={`Проект ${project.name} — от ${formatPrice(project.priceFrom)}`}>
      <div className={styles.body}>
        <div className={styles.heading}>
          <h3>Дом «{project.name}»</h3>
          <span className={styles.action} aria-hidden><ArrowIcon /></span>
        </div>
        <p className={styles.description}>{project.summary}</p>
        <ul className={styles.specs} aria-label="Характеристики дома">
          <li><LuMaximize2 aria-hidden />{project.area} м²</li>
          <li><LuBedDouble aria-hidden />{pluralized(project.bedrooms, ['спальня', 'спальни', 'спален'])}</li>
          <li><LuClock3 aria-hidden />{pluralized(project.days, ['день', 'дня', 'дней'])}</li>
        </ul>
      </div>
      <div className={styles.scene}>
        <Image src={`/photos/project-cards-v7/${project.slug}.png`} alt={project.photoAlt} priority={priority} fill sizes="(min-width: 1440px) 440px, (min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw" />
        <p className={styles.price}>от {formatPrice(project.priceFrom)}</p>
      </div>
    </Link>
  </article>
}



