'use client'

import { cn } from '@/lib/utils'
import { STEPS } from './visuals'

/**
 * Индикатор шагов без переключения: семь сегментов прогресса и подписи под ними.
 * Пройденные — фирменный цвет, текущий — тёмный, будущие — бледные. Шаг меняется
 * только кнопками «Назад» и «Дальше», чтобы выбор шёл по порядку.
 */
export function StepProgress({ current }: { current: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-[12.5px] text-ink-soft">
        <span>
          Шаг {current + 1} из {STEPS.length}
        </span>
        <span className="truncate lg:hidden">{STEPS[current].title}</span>
      </div>
      <ol className="mt-2 grid grid-cols-7 gap-1.5" aria-label="Шаги конструктора">
        {STEPS.map((step, index) => {
          const done = index < current
          const active = index === current
          return (
            <li key={step.id} aria-current={active ? 'step' : undefined} className="min-w-0">
              <span
                className={cn(
                  'block h-1 rounded-full transition-colors duration-300',
                  done ? 'bg-brand' : active ? 'bg-dark' : 'bg-black/10',
                )}
              />
              <span
                className={cn(
                  'mt-1.5 hidden truncate text-[11.5px] leading-none lg:block',
                  active ? 'font-medium text-ink' : done ? 'text-brand-deep' : 'text-ink-faint',
                )}
              >
                {step.short}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
