import type { ReactNode } from 'react'
import { LeadForm } from '@/components/ui/LeadForm'
import { Section } from '@/components/ui/Section'
import { company, promises } from '@/content/company'
import { telHref } from '@/lib/utils'

/**
 * Финальная тёмная панель с формой. Живёт на главной и на внутренних
 * страницах: заголовок, тип формы и контекст (проект, площадь) можно
 * переопределить, чтобы заявка приходила с пометкой, откуда она.
 */
export function FinalCta({
  formType = 'final-cta',
  title,
  lead,
  projectSlug,
  area,
}: {
  formType?: string
  title?: ReactNode
  lead?: ReactNode
  projectSlug?: string
  area?: number
} = {}) {
  return (
    <Section id="final-form">
      <div className="panel panel--dark on-dark">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-16">
          <div>
            <h2>{title ?? <>Рассчитаем ваш дом за {promises.estimateDays} дня</>}</h2>
            <p className="lead mt-5 max-w-xl">
              {lead ?? (
                <>
                  Оставьте телефон — уточним участок и пожелания, посчитаем{' '}
                  <strong>смету по вашей планировке</strong> и пришлём её в PDF.{' '}
                  <strong>Замер на участке бесплатный</strong>, даже если вы потом выберете
                  другого подрядчика.
                </>
              )}
            </p>

            <ul className="mt-8 space-y-4 border-t border-white/12 pt-8 text-[15px]">
              {[
                'Смета с составом работ до последнего винта',
                'График по этапам с датами и суммами платежей',
                'Список того, что в цену не входит — до подписания, а не после',
              ].map((item) => (
                <li key={item} className="flex gap-4">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-white/70" />
                  {item}
                </li>
              ))}
            </ul>

            <p className="muted mt-8 text-[15px]">
              Или позвоните:{' '}
              <a href={telHref(company.phone)} className="link-underline font-heading text-[18px] text-white tabular-nums">
                {company.phone}
              </a>
              <br />
              {company.workHours}
            </p>
          </div>

          <div className="rounded-xl bg-white/6 p-6 md:p-7">
            <h3 className="text-[19px]">Заявка на расчёт</h3>
            <p className="muted mt-2 text-[14px] leading-[1.55]">
              Два поля, остальное спросим по телефону.
            </p>
            <div className="mt-6">
              <LeadForm
                formType={formType}
                submitLabel="Получить смету"
                withComment
                projectSlug={projectSlug}
                area={area}
              />
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
