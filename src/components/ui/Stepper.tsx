'use client'

import { cn } from '@/lib/utils'

/** Шаговый переключатель числа: площадь, спальни, площадь террасы */
export function Stepper({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  tone = 'light',
  grouped,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
  tone?: 'light' | 'dark'
  /** Разделять разряды пробелами: для сумм в рублях «5 640 000» вместо «5640000» */
  grouped?: boolean
}) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next))
  const isDark = tone === 'dark'
  const display = grouped ? new Intl.NumberFormat('ru-RU').format(value) : String(value)

  return (
    <div>
      <span className="field-label">{label}</span>
      <div
        className={cn(
          'flex items-stretch overflow-hidden rounded-md border',
          isDark ? 'border-white/15 bg-white/5' : 'border-line bg-surface',
        )}
      >
        <button
          type="button"
          onClick={() => onChange(clamp(value - step))}
          disabled={value <= min}
          aria-label={`Уменьшить: ${label}`}
          className={cn(
            'flex h-14 w-12 shrink-0 items-center justify-center text-[20px] leading-none transition-colors duration-200 ease-out disabled:opacity-35',
            isDark ? 'hover:bg-white/10' : 'hover:bg-panel',
          )}
        >
          −
        </button>
        <label className="flex flex-1 items-center justify-center gap-1.5 px-1">
          <input
            type={grouped ? 'text' : 'number'}
            inputMode="numeric"
            value={display}
            min={grouped ? undefined : min}
            max={grouped ? undefined : max}
            step={grouped ? undefined : step}
            onChange={(event) => {
              const raw = grouped ? event.target.value.replace(/\D/g, '') : event.target.value
              const next = Number(raw)
              if (raw !== '' && !Number.isNaN(next)) onChange(clamp(next))
            }}
            aria-label={label}
            className="num w-full bg-transparent text-center text-[20px] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {unit ? <span className="shrink-0 text-[14px] muted">{unit}</span> : null}
        </label>
        <button
          type="button"
          onClick={() => onChange(clamp(value + step))}
          disabled={value >= max}
          aria-label={`Увеличить: ${label}`}
          className={cn(
            'flex h-14 w-12 shrink-0 items-center justify-center text-[20px] leading-none transition-colors duration-200 ease-out disabled:opacity-35',
            isDark ? 'hover:bg-white/10' : 'hover:bg-panel',
          )}
        >
          +
        </button>
      </div>
    </div>
  )
}

/** Переключатель вариантов: комплектация, фундамент, кровля */
export function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  tone = 'light',
}: {
  label: string
  options: { value: T; label: string; note?: string }[]
  value: T
  onChange: (value: T) => void
  tone?: 'light' | 'dark'
}) {
  const isDark = tone === 'dark'

  return (
    <fieldset>
      <legend className="field-label">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const selected = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
              className={cn(
                'min-h-14 rounded-md border px-4 py-3 text-left transition-colors duration-200 ease-out',
                // Цвета задаём явно: на тёмной панели наследование сделало бы
                // подпись белой по белому
                selected
                  ? isDark
                    ? 'border-white bg-white text-ink'
                    : 'border-dark bg-dark text-white'
                  : isDark
                    ? 'border-white/15 text-white hover:bg-white/8'
                    : 'border-line bg-surface text-ink hover:border-ink-faint',
              )}
            >
              <span className="block font-heading text-[14px] font-medium leading-tight">
                {option.label}
              </span>
              {option.note ? (
                <span
                  className={cn(
                    'mt-1 block text-[13px] leading-tight',
                    selected ? 'opacity-65' : 'opacity-55',
                  )}
                >
                  {option.note}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
