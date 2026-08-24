/**
 * Тонкая обёртка над аналитикой. Сейчас события копятся в очереди и уходят в
 * Яндекс.Метрику, когда она инициализирована — а инициализируется она только
 * после согласия на cookie (пятая итерация). Компонентам знать об этом не нужно:
 * они просто зовут track().
 */

export type AnalyticsEvent =
  | 'form_view'
  | 'form_start'
  | 'form_submit'
  | 'form_error'
  | 'calc_complete'
  | 'phone_click'
  | 'messenger_click'
  | 'chat_open'
  | 'catalog_filter'
  | 'project_view'
  | 'pdf_download'
  | 'lk_login'

type EventParams = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    ym?: (counterId: number, action: string, ...args: unknown[]) => void
    __derevyagaEventQueue?: Array<[AnalyticsEvent, EventParams | undefined]>
  }
}

const COUNTER_ID = Number(process.env.NEXT_PUBLIC_YM_COUNTER_ID ?? 0)

export function track(event: AnalyticsEvent, params?: EventParams): void {
  if (typeof window === 'undefined') return

  if (typeof window.ym === 'function' && COUNTER_ID) {
    window.ym(COUNTER_ID, 'reachGoal', event, params)
    return
  }

  window.__derevyagaEventQueue ??= []
  window.__derevyagaEventQueue.push([event, params])

  if (process.env.NODE_ENV === 'development') {
    // Чтобы в разработке было видно, что событие сработало
    console.info('[analytics]', event, params ?? {})
  }
}
