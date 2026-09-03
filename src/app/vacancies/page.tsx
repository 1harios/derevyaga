import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { LeadForm } from '@/components/ui/LeadForm'
import { Section, SectionHeader } from '@/components/ui/Section'
import { company } from '@/content/company'
import { vacancies, workConditions } from '@/content/vacancies'

export const metadata: Metadata = {
  title: 'Вакансии для бригад: плотники, прорабы, отделочники',
  description:
    'Работа в штатных бригадах: оплата по принятым этапам без задержек, инструмент компании, загрузка круглый год. Вакансии плотника-каркасника, прораба и мастера отделки.',
  alternates: { canonical: '/vacancies' },
}

export default function VacanciesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Вакансии' }]}
        title="Ищем тех, кто строит по узлам, а не «на глаз»"
        lead={
          <>
            Штатные бригады — основа компании, поэтому берём людей надолго.
            Оплата — <strong>по принятым этапам, без задержек</strong>, инструмент наш,
            загрузка круглый год.
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          {vacancies.map((vacancy) => (
            <a
              key={vacancy.id}
              href={`#${vacancy.id}`}
              className="chip bg-surface transition-colors duration-200 ease-out hover:bg-dark hover:text-white"
            >
              {vacancy.title}
            </a>
          ))}
        </div>
      </PageHero>

      <Section compact>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {workConditions.map((condition) => (
            <div key={condition.title} className="card rounded-xl p-6">
              <h3 className="text-[16px]">{condition.title}</h3>
              <p className="mt-2.5 text-[14px] leading-[1.6] muted">{condition.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader
          title="Кого ждём сейчас"
          description="Если вашей специальности нет в списке, всё равно напишите — сильных людей записываем в резерв и зовём первыми."
        />

        <div className="stack">
          {vacancies.map((vacancy) => (
            <article key={vacancy.id} id={vacancy.id} className="card scroll-mt-24 rounded-xl p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-xl">
                  <h3 className="text-[clamp(1.2rem,1.05rem+0.6vw,1.5rem)]">{vacancy.title}</h3>
                  <p className="mt-2 text-[15px] leading-[1.6] muted">{vacancy.summary}</p>
                </div>
                <div className="min-w-0 max-w-full text-left sm:shrink-0 sm:text-right">
                  <div className="num text-[18px] [overflow-wrap:anywhere] sm:text-[20px]">
                    {vacancy.pay}
                  </div>
                  <div className="mt-1 text-[13px] leading-[1.45] muted [overflow-wrap:anywhere]">
                    {vacancy.format}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-6 border-t border-line pt-6 md:grid-cols-2">
                <div>
                  <p className="caption mb-3">Что делать</p>
                  <ul className="space-y-2.5 text-[14.5px] leading-[1.55]">
                    {vacancy.duties.map((duty) => (
                      <li key={duty} className="flex gap-3">
                        <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
                        {duty}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="caption mb-3">Что важно</p>
                  <ul className="space-y-2.5 text-[14.5px] leading-[1.55] muted">
                    {vacancy.requirements.map((requirement) => (
                      <li key={requirement} className="flex gap-3">
                        <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-ink-faint" />
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <div className="panel panel--dark on-dark">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-16">
            <div>
              <h2>Расскажите о себе — перезвоним за день</h2>
              <p className="lead mt-5 max-w-xl">
                Телефон и пара слов: специальность, опыт, какие объекты делали.
                Портфолио и разговор о деньгах — уже голосом. Резюме по форме
                не нужно.
              </p>
              <p className="muted mt-6 text-[15px]">
                Или напишите напрямую:{' '}
                <a href={company.telegram} className="link-underline text-white">
                  Telegram
                </a>{' '}
                ·{' '}
                <a href={`mailto:${company.email}`} className="link-underline text-white">
                  {company.email}
                </a>
              </p>
            </div>

            <div className="rounded-xl bg-white/6 p-6 md:p-7">
              <h3 className="text-[19px]">Отклик на вакансию</h3>
              <div className="mt-6">
                <LeadForm
                  formType="vacancy"
                  submitLabel="Отправить отклик"
                  withComment
                  successNote="Отклик получили. Перезвоним в течение рабочего дня — обсудим опыт и объекты, покажем ближайшую стройку."
                />
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
