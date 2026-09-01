'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { company } from '@/content/company'
import { track } from '@/lib/analytics'
import { telHref } from '@/lib/utils'

/**
 * Липкая панель действия на мобильном. Появляется после первого экрана
 * и прячется у финальной формы, чтобы не перекрывать её и кнопку чата.
 */
export function StickyCta() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const finalForm = document.getElementById('final-form')

    const onScroll = () => {
      const passedHero = window.scrollY > window.innerHeight * 0.8
      const finalFormVisible = finalForm
        ? finalForm.getBoundingClientRect().top < window.innerHeight
        : false
      const nextVisible = passedHero && !finalFormVisible
      setVisible(nextVisible)
      document.documentElement.classList.toggle('sticky-cta-visible', nextVisible)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.documentElement.classList.remove('sticky-cta-visible')
    }
  }, [])

  return (
    <div
      className={`fixed bottom-3 left-3 right-[70px] z-40 transition-transform duration-200 ease-out lg:hidden ${
        visible ? 'translate-y-0' : 'translate-y-[140%]'
      }`}
      aria-hidden={!visible}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center gap-2">
        <a
          href={telHref(company.phone)}
          onClick={() => track('phone_click', { place: 'sticky' })}
          tabIndex={visible ? 0 : -1}
          aria-label="Позвонить"
          className="icon-btn size-13 shrink-0"
        >
          <svg viewBox="0 0 20 20" className="size-5" aria-hidden fill="currentColor">
            <path d="M6.6 3.2 8 6.1 6.4 7.7c.9 1.9 2 3 3.9 3.9L12 10l2.9 1.4c.5.3.7.9.5 1.4l-.7 1.8c-.2.6-.8 1-1.4.9-5-.6-8.8-4.4-9.4-9.4-.1-.6.3-1.2.9-1.4l1.8-.7c.5-.2 1.1 0 1.4.5Z" />
          </svg>
        </a>
        <Link
          href="/#final-form"
          tabIndex={visible ? 0 : -1}
          className="btn btn--dark flex-1 shadow-float"
        >
          Рассчитать дом
        </Link>
      </div>
    </div>
  )
}
