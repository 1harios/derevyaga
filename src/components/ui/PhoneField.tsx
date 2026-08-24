'use client'

import { useId } from 'react'
import { formatPhoneMask } from '@/lib/utils'

export function PhoneField({
  value,
  onChange,
  error,
  hint = 'Позвоним в течение рабочего дня, без спама и рассылок',
  autoFocus,
}: {
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
  autoFocus?: boolean
}) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  return (
    <div>
      <label className="field-label" htmlFor={id}>
        Телефон
      </label>
      <input
        id={id}
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        autoFocus={autoFocus}
        required
        placeholder="+7 (___) ___-__-__"
        value={value}
        onChange={(event) => onChange(formatPhoneMask(event.target.value))}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : hintId}
        className="field-input"
      />
      {error ? (
        <p id={errorId} role="alert" className="field-error">
          {error}
        </p>
      ) : (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
    </div>
  )
}

export function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  optional,
  type = 'text',
  inputMode,
}: {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  optional?: boolean
  type?: string
  inputMode?: 'text' | 'numeric' | 'decimal'
}) {
  const id = useId()

  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
        {optional ? <span className="ml-2 normal-case tracking-normal opacity-70">необязательно</span> : null}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="field-input"
      />
    </div>
  )
}
