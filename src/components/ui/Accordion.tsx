import type { ReactNode } from 'react'

/** Аккордеон на нативных details/summary: работает без JavaScript и доступен с клавиатуры */
export function Accordion({ children }: { children: ReactNode }) {
  return <div className="stack">{children}</div>
}

export function AccordionItem({
  question,
  children,
  defaultOpen,
}: {
  question: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  return (
    <details
      className="group card overflow-hidden [&_summary::-webkit-details-marker]:hidden"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 p-5 md:p-6">
        <span className="font-heading text-[16px] font-medium leading-snug md:text-[18px]">
          {question}
        </span>
        <span
          aria-hidden
          className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-panel transition-colors duration-200 ease-out group-open:bg-dark group-open:text-white"
        >
          <span className="absolute h-px w-3.5 bg-current" />
          <span className="absolute h-3.5 w-px bg-current transition-transform duration-200 ease-out group-open:scale-y-0" />
        </span>
      </summary>
      <div className="max-w-3xl px-5 pb-6 text-[15px] leading-[1.6] muted md:px-6">{children}</div>
    </details>
  )
}
