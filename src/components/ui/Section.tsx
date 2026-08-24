import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Секция макета. Контент живёт внутри крупных скруглённых панелей,
 * поэтому у секции нет собственного фона — только вертикальные отступы.
 */
export function Section({
  id,
  className,
  children,
  compact,
}: {
  id?: string
  className?: string
  children: ReactNode
  compact?: boolean
}) {
  return (
    <section id={id} className={cn(compact ? 'py-6 md:py-8' : 'py-8 md:py-12', className)}>
      <div className="shell">{children}</div>
    </section>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = 'split',
  className,
}: {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  align?: 'split' | 'center'
  className?: string
}) {
  if (align === 'center') {
    return (
      <div className={cn('mx-auto mb-7 max-w-2xl text-center md:mb-10', className)}>
        {eyebrow ? (
          <p className="eyebrow mb-3 justify-center" data-reveal>
            {eyebrow}
          </p>
        ) : null}
        <h2 data-reveal>{title}</h2>
        {description ? (
          <p
            className="lead mx-auto mt-3 max-w-xl"
            data-reveal
            style={{ '--reveal-delay': '110ms' } as React.CSSProperties}
          >
            {description}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'mb-7 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="eyebrow mb-3" data-reveal>
            {eyebrow}
          </p>
        ) : null}
        <h2 data-reveal>{title}</h2>
        {description ? (
          <p
            className="lead mt-3"
            data-reveal
            style={{ '--reveal-delay': '110ms' } as React.CSSProperties}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
