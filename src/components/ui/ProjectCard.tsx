import Image from 'next/image'
import Link from 'next/link'
import { projectTagLabels, type Project } from '@/content/projects'
import { cn, formatPrice, pluralized } from '@/lib/utils'

/**
 * Карточка каталога по присланному образцу: фото на всю площадь, снизу
 * фирменный градиент, поверх него цена крупно, строка характеристик,
 * тонкий разделитель и мелкая подпись.
 */
export function ProjectCard({
  project,
  priority,
  variant = 'default',
}: {
  project: Project
  priority?: boolean
  variant?: 'default' | 'large'
}) {
  const large = variant === 'large'

  return (
    <article className={cn('group relative isolate overflow-hidden', large ? 'rounded-2xl' : 'rounded-xl')}>
      <Link href={`/projects/${project.slug}`} className="block">
        <Image
          src={project.photo}
          alt={project.photoAlt}
          width={900}
          height={1350}
          sizes={large ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 1280px) 25vw, (min-width: 768px) 45vw, 80vw'}
          priority={priority}
          className={cn(
            'w-full object-cover object-top transition-transform duration-200 ease-out group-hover:scale-[1.03]',
            large ? 'aspect-[4/3] sm:aspect-[16/10]' : 'aspect-[3/4]',
          )}
        />

        {/* Градиент на фирменном мхе: плотный снизу, прозрачный к середине */}
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-3/5"
          style={{
            backgroundImage:
              'linear-gradient(to top, #4E6254 0%, rgba(78,98,84,0.92) 28%, rgba(78,98,84,0.55) 55%, rgba(78,98,84,0) 100%)',
          }}
        />

        {project.tag ? (
          <span className="chip chip--glass absolute left-4 top-4">
            {projectTagLabels[project.tag]}
          </span>
        ) : null}

        <div className={cn('absolute inset-x-0 bottom-0 text-white', large ? 'p-5 sm:p-7' : 'p-5')}>
          <div className="flex items-end justify-between gap-4">
            <span className={cn('num', large ? 'text-[clamp(1.65rem,1.3rem+1.2vw,2.25rem)]' : 'text-[clamp(1.25rem,1.05rem+0.7vw,1.6rem)]')}>
              от {formatPrice(project.priceFrom)}
            </span>
          </div>

          <div className="mt-3 flex items-end justify-between gap-4">
            <span className={cn('leading-snug text-white/85', large ? 'text-[15px] sm:text-[17px]' : 'text-[14px]')}>
              {project.name}
              <br />
              {project.floorsLabel.toLowerCase()}
            </span>

            <span className="flex shrink-0 divide-x divide-white/25 text-center">
              <span className="px-3">
                <span className="block text-[15px] leading-none">{project.area} м²</span>
                <span className="mt-1 block text-[12px] text-white/70">площадь</span>
              </span>
              <span className="pl-3">
                <span className="block text-[15px] leading-none">{project.bedrooms}</span>
                <span className="mt-1 block text-[12px] text-white/70">спальни</span>
              </span>
            </span>
          </div>

          <div className="mt-4 border-t border-white/25 pt-3 text-[13px] text-white/70">
            Цена актуальна · срок {pluralized(project.days, ['день', 'дня', 'дней'])}
          </div>
        </div>
      </Link>
    </article>
  )
}
