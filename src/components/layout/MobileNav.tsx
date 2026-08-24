'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { company } from '@/content/company'
import { mainNav, secondaryNav } from '@/content/nav'
import { cn, telHref } from '@/lib/utils'

/**
 * Кнопка меню и само меню одним компонентом. Используется дважды: в шапке
 * внутри первого экрана и в плавающей шапке при прокрутке — у каждой свой
 * экземпляр со своим состоянием, поэтому лишних связей между ними нет.
 */
export function MobileNav({ className, size = 'md' }: { className?: string; size?: 'md' | 'sm' }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Открыть меню"
        aria-expanded={open}
        className={cn('icon-btn icon-btn--dark', size === 'sm' ? 'size-10' : 'size-11', className)}
      >
        <span aria-hidden className="relative block h-2.5 w-4">
          <span className="absolute inset-x-0 top-0 h-px bg-current" />
          <span className="absolute inset-x-0 top-1/2 h-px bg-current" />
          <span className="absolute inset-x-0 bottom-0 h-px bg-current" />
        </span>
      </button>

      <div
        className={cn(
          'fixed inset-0 z-50 overflow-y-auto bg-canvas transition-opacity duration-200 ease-out',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        role="dialog"
        aria-modal={open}
        aria-label="Меню сайта"
        aria-hidden={!open}
      >
        {/* Контент меню мягко выезжает снизу при открытии */}
        <div
          className={cn(
            'shell py-4 transition-all duration-300 ease-out',
            open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
          )}
        >
          <div className="flex items-center justify-between gap-4 py-2">
            <span className="flex items-center">
              <Image src="/brand/logo-derevyaga.webp" alt="Деревяга" width={836} height={306} className="h-8 w-auto" />
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Закрыть меню"
              tabIndex={open ? 0 : -1}
              className="icon-btn icon-btn--dark size-11 text-[18px]"
            >
              ✕
            </button>
          </div>

          <nav className="mt-4" aria-label="Разделы сайта">
            <ul className="card overflow-hidden rounded-xl">
              {mainNav.map((item, index) => (
                <li key={item.href} className={index ? 'border-t border-line' : undefined}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    tabIndex={open ? 0 : -1}
                    className="block px-5 py-4 font-heading text-[18px] font-medium"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 px-2">
              {secondaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    tabIndex={open ? 0 : -1}
                    className="text-[15px] muted"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="card mt-3 space-y-3 rounded-xl p-5">
            <a
              href={telHref(company.phone)}
              tabIndex={open ? 0 : -1}
              className="block font-heading text-[22px] font-medium tabular-nums"
            >
              {company.phone}
            </a>
            <p className="text-[14px] muted">{company.workHours}</p>
            <Button href="#final-form" onClick={() => setOpen(false)} wide arrow>
              Оставить заявку
            </Button>
            <Button href="/lk" variant="outline" wide>
              Личный кабинет
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
