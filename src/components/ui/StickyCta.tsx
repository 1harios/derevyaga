'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LuPhone } from 'react-icons/lu'
import { company, cta } from '@/content/company'
import { track } from '@/lib/analytics'
import { telHref } from '@/lib/utils'

/**
 * Липкая панель действия на мобильном. Появляется после первого экрана
 * и прячется у финальной формы, чтобы не перекрывать её и кнопку чата.
 */
export function StickyCta() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const finalForm = document.getElementById('final-form')

    const onScroll = () => {
      const passedHero = window.scrollY > window.innerHeight * 0.8
      const finalFormVisible = finalForm
        ? finalForm.getBoundingClientRect().top < window.innerHeight
        : false
      const nextVisible = pathname !== '/lk' && passedHero && !finalFormVisible
      setVisible(nextVisible)
      document.documentElement.classList.toggle('sticky-cta-visible', nextVisible)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.documentElement.classList.remove('sticky-cta-visible')
    }
  }, [pathname])

  if (pathname === '/lk') return null

  return (
    <div
      className={`mobile-lead-cta fixed bottom-3 left-3 right-[76px] z-40 transition-transform duration-200 ease-out lg:hidden ${
        visible ? 'translate-y-0' : 'translate-y-[140%]'
      }`}
      aria-hidden={!visible}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center gap-3">
        <a
          href={telHref(company.phone)}
          onClick={() => track('phone_click', { place: 'sticky' })}
          tabIndex={visible ? 0 : -1}
          aria-label="Позвонить"
          className="icon-btn size-13 shrink-0"
        >
          <LuPhone className="size-[23px]" aria-hidden />
        </a>
        <Link
          href="/#final-form"
          tabIndex={visible ? 0 : -1}
          className="btn btn--dark flex-1 shadow-float"
        >
          {cta.primary}
        </Link>
      </div>
    </div>
  )
}
