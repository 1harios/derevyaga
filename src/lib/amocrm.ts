/**
 * Адаптер amoCRM: превращает заявку с сайта в сделку с контактом.
 *
 * Использует «Комплексное добавление сделок» — POST /api/v4/leads/complex:
 * одна сделка + один контакт за запрос, телефон участвует в контроле дублей
 * на стороне amoCRM (если он включён для интеграции). Детали заявки — UTM,
 * страница, проект, комментарий — уходят примечанием к созданной сделке,
 * чтобы не зависеть от настройки дополнительных полей в аккаунте.
 *
 * Авторизация — долгосрочный токен (amoCRM → интеграция → вкладка «Ключи»):
 * он живёт до 5 лет, не требует refresh-логики и подходит для интеграции
 * под один аккаунт. Все запросы идут с заголовком Authorization: Bearer.
 *
 * Настройка — три переменные окружения (.env):
 *   AMO_DOMAIN      поддомен аккаунта, например derevyaga.amocrm.ru
 *   AMO_TOKEN       долгосрочный токен доступа
 *   AMO_PIPELINE_ID ID воронки (необязательно: по умолчанию — главная)
 *
 * Без них адаптер выключен, а API возвращает пользователю понятную ошибку:
 * персональные данные не маскируются под успешно доставленную заявку.
 */

import { cities } from '@/content/cities'

type SiteLead = {
  id: string
  receivedAt: string
  formType: string
  phone: string
  name?: string
  comment?: string
  area?: number
  projectSlug?: string
  calculationId?: string
  marketingConsent: boolean
  meta: Record<string, unknown>
}

/** Человеческие названия сделок по типу формы — видны менеджеру в воронке */
const FORM_LABELS: Record<string, string> = {
  'final-cta': 'Заявка на расчёт сметы',
  'quiz-calculator': 'Расчёт в калькуляторе',
  constructor: 'Расчёт в конструкторе дома',
  'constructor-mortgage': 'Подбор ипотеки из конструктора',
  'project-page': 'Заявка со страницы проекта',
  'projects-catalog': 'Заявка из каталога проектов',
  complectations: 'Вопрос по комплектациям',
  prices: 'Заявка со страницы цен',
  technology: 'Запрос примера расчёта',
  objects: 'Запрос экскурсии на объект',
  reviews: 'Запрос контактов владельцев',
  about: 'Заявка со страницы о компании',
  guarantee: 'Запрос шаблона договора',
  mortgage: 'Подбор ипотечной программы',
  faq: 'Вопрос со страницы FAQ',
  blog: 'Заявка из блога',
  'blog-article': 'Заявка из статьи блога',
  contacts: 'Заказ обратного звонка',
  vacancy: 'Отклик на вакансию',
}

function leadName(lead: SiteLead): string {
  if (lead.formType.startsWith('city-')) {
    const city = cities.find((item) => item.slug === lead.formType.slice(5))
    return `Заявка со страницы города (${city?.name ?? lead.formType.slice(5)})`
  }
  const base = FORM_LABELS[lead.formType] ?? `Заявка с сайта (${lead.formType})`
  return lead.projectSlug ? `${base} — ${lead.projectSlug}` : base
}

/** Короткие русские метки по типу формы — для фильтров в списке сделок */
const TAG_LABELS: Record<string, string> = {
  'final-cta': 'расчёт сметы',
  'quiz-calculator': 'калькулятор',
  constructor: 'конструктор',
  'constructor-mortgage': 'конструктор · ипотека',
  'project-page': 'страница проекта',
  'projects-catalog': 'каталог проектов',
  complectations: 'комплектации',
  prices: 'цены',
  technology: 'технология',
  objects: 'экскурсия на объект',
  reviews: 'отзывы',
  about: 'о компании',
  guarantee: 'гарантия',
  mortgage: 'ипотека',
  faq: 'вопрос',
  blog: 'блог',
  'blog-article': 'статья блога',
  contacts: 'обратный звонок',
  vacancy: 'вакансия',
}

/** Метка источника: русское название формы, для городов — «город: Имя» */
function leadTag(lead: SiteLead): string {
  if (lead.formType.startsWith('city-')) {
    const city = cities.find((item) => item.slug === lead.formType.slice(5))
    return `город: ${city?.name ?? lead.formType.slice(5)}`
  }
  return TAG_LABELS[lead.formType] ?? lead.formType
}

/** Текст примечания: всё, что менеджеру полезно видеть, в одном месте */
function noteText(lead: SiteLead): string {
  const meta = lead.meta as {
    page?: string
    referrer?: string
    utm?: Record<string, string>
    yclid?: string
    gclid?: string
    timeOnSiteSec?: number
  }

  const lines = [
    `Заявка с сайта · форма: ${leadTag(lead)} (${lead.formType})`,
    lead.name ? `Имя: ${lead.name}` : null,
    lead.comment ? `Комментарий: ${lead.comment}` : null,
    lead.projectSlug ? `Проект: ${lead.projectSlug}` : null,
    lead.area ? `Площадь: ${lead.area} м²` : null,
    lead.calculationId ? `Расчёт: ${lead.calculationId}` : null,
    meta.page ? `Страница: ${meta.page}` : null,
    meta.referrer ? `Источник перехода: ${meta.referrer}` : null,
    meta.utm && Object.keys(meta.utm).length
      ? `UTM: ${Object.entries(meta.utm).map(([key, value]) => `${key}=${value}`).join(', ')}`
      : null,
    meta.yclid ? `yclid: ${meta.yclid}` : null,
    meta.gclid ? `gclid: ${meta.gclid}` : null,
    typeof meta.timeOnSiteSec === 'number' ? `Времени на сайте: ${meta.timeOnSiteSec} с` : null,
    `Согласие на рекламу: ${lead.marketingConsent ? 'да' : 'нет'}`,
    `ID заявки на сайте: ${lead.id}`,
  ]

  return lines.filter(Boolean).join('\n')
}

export function isAmoConfigured(): boolean {
  return Boolean(process.env.AMO_DOMAIN && process.env.AMO_TOKEN)
}

async function amoRequest(path: string, body: unknown): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10_000)

  try {
    return await fetch(`https://${process.env.AMO_DOMAIN}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.AMO_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Отправка сделки. Ошибки не бросает, а сообщает результат вызывающему API.
 * API подтверждает заявку посетителю только при успешной доставке сделки.
 */
export async function sendLeadToAmo(lead: SiteLead): Promise<boolean> {
  if (!isAmoConfigured()) return false

  try {
    const pipelineId = Number(process.env.AMO_PIPELINE_ID) || undefined

    const complexResponse = await amoRequest('/api/v4/leads/complex', [
      {
        name: leadName(lead),
        ...(pipelineId ? { pipeline_id: pipelineId } : {}),
        _embedded: {
          tags: [{ name: 'сайт' }, { name: leadTag(lead) }],
          contacts: [
            {
              first_name: lead.name || 'Без имени',
              custom_fields_values: [
                {
                  field_code: 'PHONE',
                  values: [{ value: lead.phone, enum_code: 'WORK' }],
                },
              ],
            },
          ],
        },
      },
    ])

    if (complexResponse.status === 401) {
      // Долгосрочный токен отозван или истёк: пока AMO_TOKEN не перевыпущен,
      // ни одна заявка не дойдёт — пишем отдельной строкой, чтобы заметить в логах
      console.error('[amocrm] AUTH_401: amoCRM отклонила токен — проверьте или перевыпустите AMO_TOKEN')
      return false
    }

    if (!complexResponse.ok) {
      console.error('[amocrm] complex failed', complexResponse.status, await safeText(complexResponse))
      return false
    }

    const created = (await complexResponse.json()) as Array<{ id?: number }>
    const leadId = created?.[0]?.id
    if (!leadId) {
      console.error('[amocrm] complex: пустой ответ', JSON.stringify(created))
      return false
    }

    // Примечание со всеми деталями заявки — отдельным запросом
    const noteResponse = await amoRequest('/api/v4/leads/notes', [
      { entity_id: leadId, note_type: 'common', params: { text: noteText(lead) } },
    ])
    if (!noteResponse.ok) {
      console.error('[amocrm] note failed', noteResponse.status, await safeText(noteResponse))
      // Сделка уже создана — это успех, примечание не критично
    }

    console.info('[amocrm] lead created', leadId, 'site lead', lead.id)
    return true
  } catch (error) {
    console.error('[amocrm] error', error instanceof Error ? error.message : error)
    return false
  }
}

async function safeText(response: Response): Promise<string> {
  try {
    return (await response.text()).slice(0, 500)
  } catch {
    return ''
  }
}
