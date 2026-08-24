'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

/**
 * Контролы под фото героя (по референсу): два селекта-пилюли и кнопка,
 * которая ведёт в калькулятор с предзаполненными комплектацией и этажностью.
 */
const completenessOptions = [
  ['frame', 'Каркас'],
  ['prefinish', 'Под чистовую'],
  ['turnkey', 'Под ключ'],
] as const

const floorsOptions = [
  ['1', 'Один этаж'],
  ['1.5', 'С мансардой'],
  ['2', 'Два этажа'],
] as const

function PillSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly (readonly [string, string])[]
  onChange: (value: string) => void
}) {
  const current = options.find(([key]) => key === value)?.[1]
  return (
    <label className="relative inline-flex h-10 min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 rounded-full bg-white px-4 font-sans text-[13.5px] text-[#1b211d] shadow-[0_1px_4px_rgba(30,37,33,0.12)] sm:flex-none">
      <span className="truncate">{current}</span>
      <svg viewBox="0 0 12 12" aria-hidden className="size-3 shrink-0 text-[#1b211d]">
        <path d="m2.5 4.5 3.5 3.5 3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {options.map(([key, title]) => (
          <option key={key} value={key}>
            {title}
          </option>
        ))}
      </select>
    </label>
  )
}

export function HeroCalcControls() {
  const router = useRouter()
  const [completeness, setCompleteness] = useState<string>('turnkey')
  const [floors, setFloors] = useState<string>('2')

  return (
    <div className="flex flex-wrap items-center gap-2">
      <PillSelect
        label="Комплектация"
        value={completeness}
        options={completenessOptions}
        onChange={setCompleteness}
      />
      <PillSelect label="Этажность" value={floors} options={floorsOptions} onChange={setFloors} />
      <button
        type="button"
        onClick={() => router.push(`/calculator?completeness=${completeness}&floors=${floors}`)}
        className="btn btn--outline-light btn--sm h-10 max-sm:w-full"
      >
        Рассчитать
        <svg viewBox="0 0 14 14" aria-hidden className="icon-arrow size-3.5">
          <path d="M3 3h8v8M11 3 3 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
