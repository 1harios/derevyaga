'use client'

import type { MouseEvent } from 'react'
import { Button } from '@/components/ui/Button'

export function FooterCallback({ className }: { className?: string }) {
  function scrollToForm(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const form = document.getElementById('final-form')
    if (!form) return
    event.preventDefault()
    const phone = form.querySelector<HTMLInputElement>('input[type="tel"]')
    const target = phone?.closest('form') ?? form
    const top = target.getBoundingClientRect().top + window.scrollY - 120
    if (window.location.hash !== '#final-form') {
      window.history.pushState(null, '', '#final-form')
    }
    window.scrollTo({ top: Math.max(0, top), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
    phone?.focus({ preventScroll: true })
  }

  return <Button href="/#final-form" variant="light" arrow className={className} onClick={scrollToForm}>Заказать звонок</Button>
}
