'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/Button'
import { company } from '@/content/company'
import { mainNav, secondaryNav } from '@/content/nav'
import { cn, telHref } from '@/lib/utils'

const subscribeToHydration = () => () => undefined
const getClientSnapshot = () => true
const getServerSnapshot = () => false

/**
 * Кнопка меню и само меню одним компонентом. Используется дважды: в шапке
 * внутри первого экрана и в плавающей шапке при прокрутке — у каждой свой
 * экземпляр со своим состоянием, поэтому лишних связей между ними нет.
 */
export function MobileNav({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const canUsePortal = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot,
  )
  const dialogId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus())

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        return
      }

      if (event.key !== 'Tab') return

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      )
      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      window.cancelAnimationFrame(frame)
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus()
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Открыть меню"
        aria-expanded={open}
        aria-controls={dialogId}
        className={cn('icon-btn icon-btn--dark size-11', className)}
      >
        <span aria-hidden className="relative block h-2.5 w-4">
          <span className="absolute inset-x-0 top-0 h-px bg-current" />
          <span className="absolute inset-x-0 top-1/2 h-px bg-current" />
          <span className="absolute inset-x-0 bottom-0 h-px bg-current" />
        </span>
      </button>

      {canUsePortal
        ? createPortal(
          <div
            ref={dialogRef}
            id={dialogId}
            className={cn(
              'fixed inset-0 z-[10000] overflow-y-auto bg-canvas transition-opacity duration-200 ease-out',
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
                  ref={closeRef}
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
                <Button href="/#final-form" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1} wide arrow>
                  Оставить заявку
                </Button>
                <Button href="/lk" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1} variant="outline" wide>
                  Личный кабинет
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )
        : null}
    </>
  )
}
