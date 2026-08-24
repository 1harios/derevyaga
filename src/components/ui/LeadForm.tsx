'use client'

import { useRef, useState } from 'react'
import { company, promises } from '@/content/company'
import { track } from '@/lib/analytics'
import { collectLeadMeta, submitLead } from '@/lib/lead-client'
import { isValidPhone, telHref } from '@/lib/utils'
import { Button } from './Button'
import { ConsentFields } from './ConsentFields'
import { PhoneField, TextField } from './PhoneField'

type Status = 'idle' | 'submitting' | 'success' | 'failed'

export function LeadForm({
  formType,
  submitLabel = 'Получить смету',
  withName = true,
  withComment = false,
  projectSlug,
  calculationId,
  area,
  successNote,
  layout = 'stacked',
}: {
  formType: string
  submitLabel?: string
  withName?: boolean
  withComment?: boolean
  projectSlug?: string
  calculationId?: string
  area?: number
  successNote?: string
  layout?: 'stacked' | 'inline'
}) {
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [dataConsent, setDataConsent] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [phoneError, setPhoneError] = useState<string>()
  const [consentError, setConsentError] = useState<string>()
  const [failMessage, setFailMessage] = useState<string>()
  const [status, setStatus] = useState<Status>('idle')

  const startedAt = useRef<number | null>(null)

  const markStart = () => {
    if (startedAt.current === null) {
      startedAt.current = Date.now()
      track('form_start', { form: formType })
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (status === 'submitting') return

    let hasError = false

    if (!isValidPhone(phone)) {
      setPhoneError(
        phone.replace(/\D/g, '').length > 0
          ? 'Проверьте номер, кажется, не хватает цифры'
          : 'Без номера мы не сможем перезвонить',
      )
      hasError = true
    } else {
      setPhoneError(undefined)
    }

    if (!dataConsent) {
      setConsentError('Без согласия на обработку данных мы не имеем права принять заявку')
      hasError = true
    } else {
      setConsentError(undefined)
    }

    if (hasError) {
      track('form_error', { form: formType })
      return
    }

    setStatus('submitting')

    const result = await submitLead({
      formType,
      phone,
      name: name || undefined,
      comment: comment || undefined,
      area,
      projectSlug,
      calculationId,
      marketingConsent,
      companyWebsite: honeypot,
      fillMs: startedAt.current ? Date.now() - startedAt.current : 0,
      meta: collectLeadMeta(),
    })

    if (result.ok) {
      setStatus('success')
      track('form_submit', { form: formType })
    } else {
      setStatus('failed')
      setFailMessage(result.message)
      track('form_error', { form: formType })
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl bg-panel p-6 text-ink md:p-7">
        <p className="eyebrow mb-3">
          <span aria-hidden className="size-1.5 rounded-full bg-ok" />
          Заявка принята
        </p>
        <h3 className="mb-3">Перезвоним в течение рабочего дня</h3>
        <p className="text-[15px] leading-[1.6] muted">
          {successNote ??
            `Менеджер уточнит участок и пожелания, а смету пришлём за ${promises.estimateDays} рабочих дня. Удобнее в мессенджере — напишите нам, ответим там же.`}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button href={company.telegram} variant="outline" size="sm">
            Написать в Telegram
          </Button>
          <Button href={telHref(company.phone)} variant="outline" size="sm">
            {company.phone}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} onFocus={markStart} noValidate>
      <div className={layout === 'inline' ? 'grid gap-4 sm:grid-cols-2' : 'space-y-4'}>
        <PhoneField value={phone} onChange={setPhone} error={phoneError} />
        {withName ? (
          <TextField label="Имя" name="name" value={name} onChange={setName} optional placeholder="Как к вам обращаться" />
        ) : null}
        {withComment ? (
          <TextField
            label="Комментарий"
            name="comment"
            value={comment}
            onChange={setComment}
            optional
            placeholder="Участок, сроки, вопросы"
          />
        ) : null}
      </div>

      {/* Ловушка для ботов: поле скрыто от людей и не должно заполняться */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${formType}-company-website`}>Не заполняйте это поле</label>
        <input
          id={`${formType}-company-website`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      <div className="mt-5">
        <ConsentFields
          dataConsent={dataConsent}
          marketingConsent={marketingConsent}
          onDataConsentChange={setDataConsent}
          onMarketingConsentChange={setMarketingConsent}
          error={consentError}
        />
      </div>

      <div className="mt-6">
        <Button type="submit" disabled={status === 'submitting'} wide arrow={status !== 'submitting'}>
          {status === 'submitting' ? 'Отправляем…' : submitLabel}
        </Button>
      </div>

      {status === 'failed' ? (
        <p role="alert" className="field-error mt-4">
          {failMessage} Телефон:{' '}
          <a href={telHref(company.phone)} className="link-underline">
            {company.phone}
          </a>
        </p>
      ) : null}
    </form>
  )
}
