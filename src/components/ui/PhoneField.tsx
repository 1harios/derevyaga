'use client'

import { useId, useState } from 'react'
import { formatPhoneMask, isValidPhone } from '@/lib/utils'

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
  // Подсказка о неполном номере появляется сразу при уходе из поля,
  // не дожидаясь кнопки отправки; ошибка формы (проп error) приоритетнее
  const [blurError, setBlurError] = useState<string>()
  const shownError = error ?? blurError

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
        onChange={(event) => {
          const next = formatPhoneMask(event.target.value)
          onChange(next)
          if (blurError && isValidPhone(next)) setBlurError(undefined)
        }}
        onBlur={() => {
          const digits = value.replace(/\D/g, '')
          setBlurError(
            digits.length > 0 && !isValidPhone(value)
              ? 'Проверьте номер, кажется, не хватает цифры'
              : undefined,
          )
        }}
        aria-invalid={shownError ? 'true' : undefined}
        aria-describedby={shownError ? errorId : hintId}
        className="field-input"
      />
      {shownError ? (
        <p id={errorId} role="alert" className="field-error">
          {shownError}
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
  autoComplete,
}: {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  optional?: boolean
  type?: string
  inputMode?: 'text' | 'numeric' | 'decimal'
  /** Подсказка браузеру для автозаполнения: given-name, email, off… */
  autoComplete?: string
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
        autoComplete={autoComplete}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="field-input"
      />
    </div>
  )
}
