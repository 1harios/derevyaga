import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { Button } from '@/components/ui/Button'
import { LeadForm } from '@/components/ui/LeadForm'
import { AssetPlaceholder } from '@/components/ui/Placeholder'
import { Section } from '@/components/ui/Section'
import { company } from '@/content/company'
import { telHref } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Контакты: телефон, офис и мессенджеры',
  description: `Телефон ${company.phone}, ${company.workHours}. Офис: ${company.city}. Отвечаем в Telegram и WhatsApp, на объект — по записи, встретит прораб.`,
  alternates: { canonical: '/contacts' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: `Контакты — ${company.name}`,
  mainEntity: {
    '@type': 'LocalBusiness',
    name: company.name,
    telephone: company.phone,
    email: company.email,
    address: { '@type': 'PostalAddress', addressLocality: company.city, addressCountry: 'RU' },
  },
}

export default function ContactsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHero
        crumbs={[{ label: 'Контакты' }]}
        title="Проще всего — позвонить"
        lead={
          <>
            Отвечает менеджер, который ведёт объекты, а не колл-центр по скрипту.
            Удобнее переписка — <strong>Telegram и WhatsApp на этой странице</strong>,
            отвечаем в рабочие часы обычно за 15–20 минут.
          </>
        }
      />

      <Section>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
          {/* Контакты: крупный телефон и способы связи */}
          <div className="panel flex flex-col justify-between gap-10">
            <div>
              <p className="caption">Телефон</p>
              <a
                href={telHref(company.phone)}
                className="num mt-3 block text-[clamp(1.8rem,1.3rem+2vw,3rem)] transition-opacity duration-200 hover:opacity-70"
              >
                {company.phone}
              </a>
              <p className="mt-2 text-[15px] muted">{company.workHours}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button href={company.telegram} variant="outline">
                  Telegram
                </Button>
                <Button href={company.whatsapp} variant="outline">
                  WhatsApp
                </Button>
                <Button href={`mailto:${company.email}`} variant="outline">
                  {company.email}
                </Button>
              </div>
            </div>

            <div className="grid gap-6 border-t border-line pt-8 sm:grid-cols-2">
              <div>
                <p className="caption">Офис</p>
                <p className="mt-3 text-[15px] leading-[1.6]">{company.address}</p>
                <p className="mt-2 text-[14px] leading-[1.6] muted">
                  Приезжайте посмотреть образцы узлов и утепления — их можно потрогать
                  руками. Лучше предупредить о визите, чтобы менеджер был на месте.
                </p>
                <a
                  href={company.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline mt-3 inline-block text-[14px]"
                >
                  Открыть в Яндекс.Картах
                </a>
              </div>
              <div>
                <p className="caption">На объект — по записи</p>
                <p className="mt-3 text-[14px] leading-[1.6] muted">
                  Показываем строящиеся дома в будни: предупредите за сутки, на объекте
                  встретит прораб. Это лучший способ увидеть, как выглядит каркас
                  до зашивки.
                </p>
              </div>
            </div>
          </div>

          {/* Форма обратного звонка */}
          <div className="card rounded-2xl p-6 md:p-8">
            <h2 className="text-[clamp(1.2rem,1.05rem+0.6vw,1.5rem)]">Заказать звонок</h2>
            <p className="mt-2 text-[14px] leading-[1.6] muted">
              Перезвоним в рабочее время в течение 20 минут. Если удобнее в мессенджере —
              напишите об этом в комментарии.
            </p>
            <div className="mt-6">
              <LeadForm formType="contacts" submitLabel="Жду звонка" withComment />
            </div>
          </div>
        </div>

        {/* ЗАМЕНИТЬ: интерактивная карта с точкой офиса — после выбора тарифа карт */}
        <div className="mt-3">
          <AssetPlaceholder
            what="Карта с точкой офиса и подписью, как пройти от парковки"
            size="Виджет Яндекс.Карт или статичная подложка 2000×600"
            ratio="10 / 3"
          />
        </div>
      </Section>

      <Section compact>
        <div className="panel panel--dark on-dark">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16">
            <div>
              <p className="eyebrow mb-3">
                <span aria-hidden className="size-1.5 rounded-full bg-white/60" />
                Реквизиты
              </p>
              <h2 className="text-[clamp(1.2rem,1.05rem+0.6vw,1.5rem)]">
                Договор — с юридическим лицом
              </h2>
              <p className="muted mt-3 text-[14px] leading-[1.6]">
                Проверьте нас до встречи: по ИНН видно судебные дела, госконтракты
                и финансовую отчётность компании.
              </p>
            </div>
            <dl className="space-y-2.5 text-[15px]">
              <div className="flex justify-between gap-4">
                <dt className="muted">Наименование</dt>
                <dd className="text-right">{company.legal.fullName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="muted">ИНН</dt>
                <dd className="tabular-nums">{company.legal.inn}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="muted">ОГРН</dt>
                <dd className="tabular-nums">{company.legal.ogrn}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="muted">Юридический адрес</dt>
                <dd className="text-right">{company.legal.legalAddress}</dd>
              </div>
            </dl>
          </div>
        </div>
      </Section>
    </>
  )
}
