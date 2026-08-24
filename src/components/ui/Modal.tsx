'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Модальное окно на нативном <dialog>: фокус-ловушка, Esc и подложка
 * достаются из браузера, а не пишутся руками.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
      className="m-auto w-[calc(100%-24px)] max-w-lg rounded-xl bg-surface p-0 text-ink backdrop:bg-dark/60"
    >
      <div className="flex items-start justify-between gap-6 border-b border-line px-6 py-5">
        <h3 className="text-[19px]">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть окно"
          className="icon-btn size-10 shadow-none"
        >
          ✕
        </button>
      </div>
      <div className="px-6 py-6">{children}</div>
    </dialog>
  )
}
