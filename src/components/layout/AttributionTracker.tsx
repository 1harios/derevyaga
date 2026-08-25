'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { captureAttribution } from '@/lib/attribution'

/** Сохраняет метки первого рекламного перехода между страницами одной сессии. */
export function AttributionTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.toString()

  useEffect(() => {
    captureAttribution(new URLSearchParams(search))
  }, [pathname, search])

  return null
}
