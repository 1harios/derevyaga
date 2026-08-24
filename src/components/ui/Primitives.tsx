import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function ProgressBar({
  value,
  label,
  tone = 'light',
}: {
  value: number
  label?: string
  tone?: 'light' | 'dark'
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)))

  return (
    <div className="w-full">
      {label ? (
        <div className="mb-2 flex items-baseline justify-between gap-4">
          {/* Цвет подписи задаём от тона, а не классом muted: полоса может
              стоять внутри светлого блока на тёмной панели */}
          <span className={cn('text-[14px]', tone === 'dark' ? 'text-white/60' : 'text-ink-soft')}>
            {label}
          </span>
          <span className="num text-[15px]">{clamped}%</span>
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Прогресс'}
        className={cn(
          'h-1.5 w-full overflow-hidden rounded-full',
          tone === 'dark' ? 'bg-white/15' : 'bg-line',
        )}
      >
        <div
          className={cn(
            'h-full origin-left rounded-full transition-transform duration-200 ease-out',
            tone === 'dark' ? 'bg-white' : 'bg-dark',
          )}
          style={{ transform: `scaleX(${clamped / 100})`, width: '100%' }}
        />
      </div>
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('skeleton', className)} />
}

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Хлебные крошки" className="py-4">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={item.label} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href} className="link-underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'text-ink' : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast ? <span aria-hidden className="size-1 rounded-full bg-ink-faint" /> : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/** Карточка с крупной цифрой: доверие в первом экране и в блоках статистики */
export function StatCard({
  value,
  label,
  media,
  className,
}: {
  value: ReactNode
  label: string
  media?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('card flex flex-col gap-4 p-4 md:p-5', className)}>
      {media ? <div className="size-11 overflow-hidden rounded-full">{media}</div> : null}
      <div>
        <div className="num text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)]">{value}</div>
        <div className="mt-2 text-[13px] leading-snug muted">{label}</div>
      </div>
    </div>
  )
}
