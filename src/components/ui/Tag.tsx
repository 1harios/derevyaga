import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'default' | 'dark' | 'brand' | 'glass'

const toneClass: Record<Tone, string> = {
  default: '',
  dark: 'chip--dark',
  brand: 'chip--brand',
  glass: 'chip--glass',
}

export function Tag({
  children,
  tone = 'default',
  className,
}: {
  children: ReactNode
  tone?: Tone
  className?: string
}) {
  return <span className={cn('chip', toneClass[tone], className)}>{children}</span>
}

/** Бейдж статуса: этапы стройки на сайте и в кабинете */
export function StatusBadge({
  status,
}: {
  status: 'waiting' | 'in-progress' | 'done' | 'delay'
}) {
  const map = {
    waiting: { label: 'Ожидает', dot: 'bg-ink-faint', className: 'chip' },
    'in-progress': { label: 'В работе', dot: 'bg-brand', className: 'chip chip--brand' },
    done: { label: 'Готово', dot: 'bg-ok', className: 'chip' },
    delay: { label: 'Задержка', dot: 'bg-err', className: 'chip' },
  } as const

  const item = map[status]

  return (
    <span className={item.className}>
      <span aria-hidden className={cn('size-1.5 rounded-full', item.dot)} />
      {item.label}
    </span>
  )
}
