'use client'

import { useId, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type TabItem = {
  id: string
  label: string
  content: ReactNode
}

export function Tabs({ items, initialId }: { items: TabItem[]; initialId?: string }) {
  const [active, setActive] = useState(initialId ?? items[0]?.id)
  const baseId = useId()

  return (
    <div>
      <div role="tablist" aria-label="Разделы" className="flex flex-wrap gap-1 rounded-full bg-panel p-1">
        {items.map((item) => {
          const selected = item.id === active
          return (
            <button
              key={item.id}
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(item.id)}
              className={cn(
                'min-h-11 flex-1 rounded-full px-4 font-heading text-[14px] font-medium transition-colors duration-200 ease-out',
                selected ? 'bg-dark text-white' : 'text-ink hover:bg-surface',
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${baseId}-panel-${item.id}`}
          aria-labelledby={`${baseId}-tab-${item.id}`}
          hidden={item.id !== active}
          className="pt-6"
        >
          {item.id === active ? item.content : null}
        </div>
      ))}
    </div>
  )
}
