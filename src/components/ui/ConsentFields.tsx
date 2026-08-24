'use client'

import Link from 'next/link'
import { useId } from 'react'

/**
 * Два раздельных чекбокса, ни один не предустановлен.
 * Смешивать согласие на обработку данных и согласие на рекламу нельзя —
 * это прямое нарушение 152-ФЗ.
 */
export function ConsentFields({
  dataConsent,
  marketingConsent,
  onDataConsentChange,
  onMarketingConsentChange,
  error,
}: {
  dataConsent: boolean
  marketingConsent: boolean
  onDataConsentChange: (value: boolean) => void
  onMarketingConsentChange: (value: boolean) => void
  error?: string
}) {
  const dataId = useId()
  const marketingId = useId()

  return (
    <div className="space-y-3">
      <Checkbox id={dataId} checked={dataConsent} onChange={onDataConsentChange} invalid={Boolean(error)}>
        Согласен на обработку персональных данных на условиях{' '}
        <Link href="/legal/consent" className="link-underline" target="_blank">
          согласия
        </Link>{' '}
        и{' '}
        <Link href="/legal/privacy" className="link-underline" target="_blank">
          политики
        </Link>
      </Checkbox>

      <Checkbox id={marketingId} checked={marketingConsent} onChange={onMarketingConsentChange}>
        Хочу получать новые проекты и акции. Отписаться можно в один клик
      </Checkbox>

      {error ? (
        <p role="alert" className="field-error">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function Checkbox({
  id,
  checked,
  onChange,
  invalid,
  children,
}: {
  id: string
  checked: boolean
  onChange: (value: boolean) => void
  invalid?: boolean
  children: React.ReactNode
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-[13px] leading-[1.5] opacity-80">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        aria-invalid={invalid ? 'true' : undefined}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm border transition-colors duration-200 ease-out peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand ${
          invalid ? 'border-err' : 'border-current/30'
        } ${checked ? 'border-transparent bg-brand' : ''}`}
      >
        {checked ? (
          <svg viewBox="0 0 12 10" className="size-3 fill-none stroke-white stroke-2">
            <path d="M1 5.2 4.3 8.5 11 1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </span>
      <span>{children}</span>
    </label>
  )
}
