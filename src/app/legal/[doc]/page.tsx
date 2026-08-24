import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageHero } from '@/components/layout/PageHero'
import { Section } from '@/components/ui/Section'
import { company } from '@/content/company'

/**
 * Юридические документы. Итоговые тексты готовит юрист (пятая итерация),
 * до этого страница честно показывает статус и состав будущего документа —
 * без «рыбы», которую можно принять за действующую политику.
 */
const docs = {
  privacy: {
    title: 'Политика обработки персональных данных',
    description: 'Как компания обрабатывает и защищает персональные данные посетителей сайта и заказчиков.',
    sections: [
      'Какие данные собираем: телефон, имя, данные заявки и параметры расчёта',
      'Зачем: связь по заявке, подготовка сметы, исполнение договора',
      'Правовые основания обработки по 152-ФЗ',
      'Где хранятся данные: серверы на территории РФ',
      'Кому передаются: CRM и сервис телефонии по поручению на обработку',
      'Сроки хранения и порядок удаления по запросу',
      'Ответственный за обработку и контакты для обращений',
    ],
  },
  consent: {
    title: 'Согласие на обработку персональных данных',
    description: 'Текст согласия, которое посетитель даёт, отправляя форму на сайте.',
    sections: [
      'Кому даётся согласие: оператор и его реквизиты',
      'Перечень данных: телефон, имя, комментарий к заявке',
      'Цели: обратная связь по заявке и подготовка расчёта',
      'Отдельное согласие на рекламные сообщения — только по явной отметке',
      'Срок действия и порядок отзыва согласия',
    ],
  },
  cookie: {
    title: 'Политика использования cookie',
    description: 'Какие cookie использует сайт и как управлять согласием на них.',
    sections: [
      'Необходимые cookie: работа форм и защита от спама',
      'Аналитические cookie: Яндекс.Метрика — только после согласия',
      'Как изменить выбор: баннер согласия и настройки браузера',
      'Сроки хранения cookie',
    ],
  },
} as const

type DocId = keyof typeof docs

export function generateStaticParams() {
  return Object.keys(docs).map((doc) => ({ doc }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ doc: string }>
}): Promise<Metadata> {
  const { doc } = await params
  const entry = docs[doc as DocId]
  if (!entry) return {}

  return {
    title: entry.title,
    description: entry.description,
    alternates: { canonical: `/legal/${doc}` },
    robots: { index: false, follow: true },
  }
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params
  const entry = docs[doc as DocId]
  if (!entry) notFound()

  return (
    <>
      <PageHero crumbs={[{ label: entry.title }]} title={entry.title} lead={entry.description} />

      <Section>
        <div className="mx-auto max-w-3xl">
          {/* ЗАМЕНИТЬ: итоговый текст от юриста. До публикации текста документ
              не считается действующим — это статус-страница, а не оферта */}
          <div className="rounded-xl border border-dashed border-line bg-panel p-6 md:p-8">
            <p className="caption">Статус документа</p>
            <p className="mt-3 text-[15px] leading-[1.65]">
              Итоговый текст готовит юрист компании — он появится здесь до запуска
              рекламы и приёма заявок. Ниже — состав будущего документа, чтобы было
              видно, что именно в нём будет закреплено.
            </p>
          </div>

          <ol className="mt-8 space-y-3">
            {entry.sections.map((section, index) => (
              <li key={section} className="card flex gap-4 rounded-lg p-5">
                <span className="num w-6 shrink-0 text-[15px] muted">{index + 1}</span>
                <span className="text-[15px] leading-[1.55]">{section}</span>
              </li>
            ))}
          </ol>

          <p className="mt-8 text-[14px] leading-[1.6] muted">
            Вопросы по обработке данных: {company.email}. Ответственный за обработку
            персональных данных — {company.legal.dataOfficer}.
          </p>
        </div>
      </Section>
    </>
  )
}
