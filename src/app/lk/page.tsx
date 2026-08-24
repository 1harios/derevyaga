import type { Metadata } from 'next'
import { CabinetBlock } from '@/components/home/CabinetBlock'
import { PageHero } from '@/components/layout/PageHero'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { company } from '@/content/company'
import { telHref } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Личный кабинет заказчика',
  description:
    'Личный кабинет со стройкой онлайн: фотоотчёты каждые 7 дней, статусы этапов с план-фактом, документы и график платежей. Доступ выдаётся в день подписания договора.',
  alternates: { canonical: '/lk' },
  robots: { index: false, follow: true },
}

/**
 * Витрина кабинета + вход. Сам кабинет с авторизацией по СМС появится
 * на четвёртой итерации — до тех пор страница честно объясняет, как
 * получить доступ, и не делает вид, что форма входа работает.
 */
export default function CabinetPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Личный кабинет' }]}
        title="Ваша стройка — онлайн"
        lead={
          <>
            Кабинет открывается <strong>в день подписания договора</strong>: фотоотчёты,
            статусы этапов с план-фактом, документы, платежи и чат с прорабом. Ниже —
            как он выглядит изнутри.
          </>
        }
      >
        <div className="card inline-flex max-w-xl flex-col gap-4 rounded-xl p-6 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h2 className="text-[16px]">Вход появится здесь</h2>
            <p className="mt-1.5 text-[14px] leading-[1.55] muted">
              Вход по номеру телефона и коду из СМС сейчас в разработке. Заказчикам
              со стройкой в работе отчёты пока отправляет менеджер — как обычно,
              раз в неделю.
            </p>
          </div>
          <Button href={telHref(company.phone)} variant="outline" size="sm" className="shrink-0">
            Связаться с менеджером
          </Button>
        </div>
      </PageHero>

      <CabinetBlock />

      <Section compact>
        <p className="mx-auto max-w-2xl text-center text-[14px] leading-[1.6] muted">
          Доступ в кабинет — часть договора, а не платная опция. Если строите с нами
          и не получили доступ, напишите менеджеру или позвоните: {company.phone}.
        </p>
      </Section>
    </>
  )
}
