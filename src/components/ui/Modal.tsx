'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'

/** Native dialog with explicit Tab wrapping so focus stays in the window. */
export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'default',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'default' | 'wide' | 'gallery'
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (!open) return
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    if (!dialog.open) dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
      if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true })
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
          'a[href], button, input, select, textarea, [tabindex]',
        )).filter((element) => element.tabIndex >= 0 && !element.matches(':disabled') && element.getClientRects().length > 0)
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }}
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={(event) => {
        if (event.target !== ref.current) return
        const bounds = event.currentTarget.getBoundingClientRect()
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose()
      }}
      className={`m-auto max-h-[94dvh] w-[calc(100%-24px)] overflow-y-auto overscroll-contain rounded-xl bg-surface p-0 text-ink backdrop:bg-dark/80 ${size === 'gallery' ? 'max-w-[1600px]' : size === 'wide' ? 'max-w-[1040px]' : 'max-w-lg'}`}
    >
      <div className={`sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6 ${size === 'gallery' ? 'bg-[#161c19] text-white' : 'bg-surface'}`}>
        <h3 id={titleId} className="text-[19px]">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть окно"
          className="icon-btn size-11 shrink-0 shadow-none"
        >
          ✕
        </button>
      </div>
      <div className={`px-3 py-3 sm:px-5 sm:py-5 ${size === 'gallery' ? 'bg-[#161c19]' : ''}`}>{children}</div>
    </dialog>
  )
}
