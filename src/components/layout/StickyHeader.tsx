'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { company, cta } from '@/content/company'
import { MobileNav } from '@/components/layout/MobileNav'
import { headerNav } from '@/content/nav'
import { track } from '@/lib/analytics'
import { telHref } from '@/lib/utils'

/**
 * Плавающая шапка: наверху страницы её нет — там работает шапка внутри панели
 * первого экрана. После первого экрана шапка «собирается» в стеклянную пилюлю:
 * выезжает сверху с проявлением и лёгким масштабом, ссылки появляются каскадом.
 *
 * Анимируем только opacity и transform, поэтому прокрутка не дёргается.
 */
export function StickyHeader() {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 320)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <a href="#main" className="sr-only-focusable btn btn--dark absolute left-4 top-4 z-50">
        Перейти к содержимому
      </a>

      <div
        className={`fixed inset-x-0 top-0 z-40 pt-2 transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)] md:pt-3 ${
          shown
            ? 'translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-6 scale-[0.985] opacity-0'
        }`}
      >
        <div className="shell">
          <div className="flex items-center justify-between gap-5 rounded-full border border-line/70 bg-white/85 py-2 pl-4 pr-2 shadow-float backdrop-blur-xl md:pl-5">
            <Link
              href="/"
              aria-label="Деревяга — на главную"
              className="shrink-0 transition-opacity duration-200 ease-out hover:opacity-80"
            >
              <Image
                src="/brand/logo-derevyaga.webp"
                alt="Деревяга"
                width={836}
                height={306}
                className="h-8 w-auto"
              />
            </Link>

            <nav aria-label="Меню при прокрутке" className="hidden lg:block">
              <ul className="flex items-center gap-8">
                {headerNav.map((item, index) => (
                  <li
                    key={item.href}
                    style={{ transitionDelay: shown ? `${80 + index * 45}ms` : '0ms' }}
                    className={`transition-all duration-300 ease-out ${
                      shown ? 'translate-y-0 opacity-100' : '-translate-y-1.5 opacity-0'
                    }`}
                  >
                    <Link
                      href={item.href}
                      className="nav-link whitespace-nowrap text-[14px] muted hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-3">
              <a
                href={telHref(company.phone)}
                onClick={() => track('phone_click', { place: 'sticky-header' })}
                className="hidden items-center gap-2 font-heading text-[14px] font-medium tabular-nums transition-opacity duration-200 hover:opacity-70 md:flex"
              >
                <svg viewBox="0 0 16 16" aria-hidden className="icon-phone size-3.5 text-brand">
                  <path
                    d="M3.6 2.4h2.3l1.1 2.9-1.5 1.2a9.4 9.4 0 0 0 4 4l1.2-1.5 2.9 1.1v2.3c0 .6-.5 1.1-1.1 1-6-.6-9.9-4.5-10.5-10.5 0-.6.5-1 1-1Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>
                {company.phone}
              </a>
              <a
                href="/lk"
                aria-label="Личный кабинет"
                title="Личный кабинет"
                className="btn btn--outline btn--sm btn--icon hidden md:inline-flex"
              >
                <svg viewBox="0 0 16 16" aria-hidden className="icon-user size-4">
                  <path
                    d="M8 7.4a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4Z M2.9 13.8c.6-2.5 2.6-3.9 5.1-3.9s4.5 1.4 5.1 3.9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <Button href="/#final-form" size="sm" arrow className="hidden sm:inline-flex">
                {cta.primary}
              </Button>
              <MobileNav className="lg:hidden" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
