'use client'
import type { ReactNode } from 'react'
import { LuCheck } from 'react-icons/lu'
export type OptionCard<Id extends string> = { id: Id; label: string; note?: string; price?: string; priceNote?: string; preview?: ReactNode }
export function OptionCards<Id extends string>({ label, value, onChange, options, variant = 'tile' }: {
  label: string; value: Id; onChange: (id: Id) => void; options: ReadonlyArray<OptionCard<Id>>; columns?: 2 | 3; variant?: 'tile' | 'row'
}) {
  return <fieldset className="constructor-choices"><legend className="sr-only">{label}</legend><div className={`constructor-choice-grid ${variant === 'row' ? 'constructor-choice-grid--sizes' : ''}`}>
    {options.map((option) => <button key={option.id} type="button" aria-pressed={option.id === value} onClick={() => onChange(option.id)} className="constructor-choice">
      {option.preview ? <span className="constructor-choice-preview">{option.preview}</span> : null}
      <span className="constructor-choice-copy"><span className="constructor-choice-title">{option.label}</span>{option.note ? <span className="constructor-choice-note">{option.note}</span> : null}{option.price ? <span className="constructor-choice-price">{option.price}</span> : null}</span>
      <span className="constructor-choice-check" aria-hidden>{option.id === value ? <LuCheck/> : null}</span>
    </button>)}
  </div></fieldset>
}
