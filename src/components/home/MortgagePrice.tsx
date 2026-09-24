'use client'

import { useId, useState } from 'react'
import { LuHouse } from 'react-icons/lu'
import { formatPrice } from '@/lib/utils'
import styles from './FeaturedHomeCard.module.css'

export function MortgagePrice({ monthly, rate, downPaymentPct, termYears }: {
  monthly: number; rate: number; downPaymentPct: number; termYears: number
}) {
  const id = useId()
  const [open, setOpen] = useState(false)
  return <div className={styles.mortgageWrap} onPointerEnter={(event) => { if (event.pointerType === 'mouse') setOpen(true) }} onPointerLeave={(event) => { if (event.pointerType === 'mouse') setOpen(false) }}>
    <button type="button" className={`${styles.price} ${styles.mortgage}`} aria-describedby={open ? id : undefined}
      aria-expanded={open} onClick={() => setOpen(true)} onFocus={(event) => { if (event.currentTarget.matches(':focus-visible')) setOpen(true) }}
      onBlur={() => setOpen(false)} onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false) }}>
      {formatPrice(monthly)}/мес.
    </button>
    {open && <div id={id} role="tooltip" className={styles.tooltip}>
      <span className={styles.tooltipHeader}>
        <span className={styles.tooltipIcon}><LuHouse aria-hidden /></span>
        <span><span className={styles.tooltipEyebrow}>Покупка дома</span><strong className={styles.tooltipTitle}>Семейная ипотека</strong></span>
      </span>
      <span className={styles.tooltipTerms}>
        <span><b>{rate}%</b><small>ставка в год</small></span>
        <span><b>{downPaymentPct}%</b><small>первый взнос</small></span>
        <span><b>{termYears} лет</b><small>срок кредита</small></span>
      </span>
      <span className={styles.tooltipNote}>Расчёт предварительный. Условия уточнит банк.</span>
    </div>}
  </div>
}
