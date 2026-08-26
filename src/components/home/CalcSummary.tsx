import type { CalcResult } from '@/lib/pricing/engine'
import { formatPrice, pluralized } from '@/lib/utils'

export function CalcSummary({ result, compact }: { result: CalcResult; compact?: boolean }) {
  return (
    <div className="on-dark rounded-xl bg-dark p-6 text-white md:p-7">
      <p className="caption">Предварительный расчёт</p>

      <div className="num mt-3 text-[clamp(1.7rem,1.2rem+1.9vw,2.4rem)]">
        {formatPrice(result.priceFrom)}
      </div>
      <div className="muted mt-2 text-[14px]">
        до {formatPrice(result.priceTo)} · {Math.round(result.pricePerM2 / 1000)} тыс ₽ за м²
      </div>

      <dl className="mt-6 space-y-2 border-t border-white/12 pt-5 text-[15px]">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
          <dt className="min-w-0 muted">Срок стройки</dt>
          <dd className="tabular-nums">{pluralized(result.days, ['день', 'дня', 'дней'])}</dd>
        </div>

        <p className="muted pt-3 text-[13px]">Из чего складывается середина диапазона</p>

        {result.breakdown.map((row) => (
          <div key={row.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
            <dt className="min-w-0 muted">{row.label}</dt>
            <dd className="shrink-0 tabular-nums">{formatPrice(row.value)}</dd>
          </div>
        ))}
      </dl>

      {!compact ? (
        <div className="mt-6 border-t border-white/12 pt-5">
          <p className="muted mb-3 text-[13px]">График платежей</p>
          <ul className="space-y-1.5 text-[14px]">
            {result.payments.map((payment) => (
              <li key={payment.stage} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
                <span className="min-w-0 muted">{payment.stage}</span>
                <span className="shrink-0 tabular-nums">
                  {Math.round(payment.share * 100)}% · {formatPrice(payment.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="muted mt-6 border-t border-white/12 pt-5 text-[13px] leading-[1.5]">
        Диапазон, а не точная цифра: итог зависит от грунтов, подъезда к участку и выбранных
        материалов. Точная смета — после выезда замерщика, он бесплатный.
      </p>
    </div>
  )
}
