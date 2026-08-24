import type { Metadata } from 'next'
import { FinalCta } from '@/components/home/FinalCta'
import { PageHero } from '@/components/layout/PageHero'
import { Button } from '@/components/ui/Button'
import { ComparisonMatrix } from '@/components/ui/ComparisonMatrix'
import { ComplectationColumns } from '@/components/ui/ComparisonTable'
import { Section, SectionHeader } from '@/components/ui/Section'
import { complectations, neverIncluded, upgradeNotes } from '@/content/complectations'
import { formatNumber } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Комплектации: что входит в цену каркасного дома',
  description: `Три комплектации — «Каркас» от ${formatNumber(complectations[0].pricePerM2)} ₽/м², «Под чистовую» и «Под ключ». Состав работ до последнего винта и честный список того, что не входит.`,
  alternates: { canonical: '/complectations' },
}

export default function ComplectationsPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Комплектации' }]}
        title="Три комплектации, состав до последнего винта"
        lead={
          <>
            Разница между комплектациями — <strong>в объёме работ, а не в качестве</strong>:
            конструктив, утепление и узлы одинаковые во всех трёх. Ниже — короткие карточки
            и подробная таблица, по которой видно каждую строку сметы.
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          {complectations.map((item) => (
            <span key={item.id} className="chip bg-surface">
              {item.name} — от {formatNumber(item.pricePerM2)} ₽/м²
            </span>
          ))}
        </div>
      </PageHero>

      <Section>
        <ComplectationColumns />
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Подробное сравнение"
          title="Каждая строка сметы — в таблице"
          description={
            <>
              Так удобнее сравнивать нас с другими подрядчиками: попросите у них{' '}
              <strong>такой же список</strong> и сверьте строки, а не итоговые цифры.
            </>
          }
        />
        <ComparisonMatrix />
      </Section>

      <Section>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* Честный список: что не входит никуда */}
          <div className="panel panel--dark on-dark">
            <h2 className="text-[clamp(1.3rem,1.1rem+0.8vw,1.75rem)]">
              Что не входит ни в одну комплектацию
            </h2>
            <p className="lead mt-4">
              Говорим об этом до подписания, а не после. Эти работы зависят от участка,
              а не от дома, поэтому в фиксированную смету не входят.
            </p>
            <ul className="mt-7 space-y-4 border-t border-white/12 pt-7 text-[15px]">
              {neverIncluded.map((item) => (
                <li key={item} className="flex gap-4">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-white/70" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="muted mt-7 text-[14px] leading-[1.6]">
              Септик, скважину и подведение сетей можем организовать через проверенных
              подрядчиков — посчитаем отдельной сметой после уточнения грунтов.
            </p>
          </div>

          {/* Как переходят между комплектациями */}
          <div className="stack">
            {upgradeNotes.map((note) => (
              <div key={note.title} className="card rounded-xl p-6 md:p-7">
                <h3 className="text-[17px]">{note.title}</h3>
                <p className="mt-2.5 text-[14.5px] leading-[1.6] muted">{note.text}</p>
              </div>
            ))}
            <div className="rounded-xl bg-panel p-6 md:p-7">
              <p className="text-[15px] leading-[1.6]">
                Не уверены, какая комплектация ваша? Посчитайте обе в калькуляторе —
                разница сразу видна в цифрах, а не на словах.
              </p>
              <div className="mt-4">
                <Button href="/calculator" variant="outline" arrow>
                  Открыть калькулятор
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <FinalCta
        formType="complectations"
        title="Пришлём смету по вашей комплектации"
        lead={
          <>
            Скажите площадь и комплектацию — пришлём смету в PDF со{' '}
            <strong>составом работ по этапам</strong> и графиком платежей. Сравнивайте
            с кем угодно: смета останется у вас в любом случае.
          </>
        }
      />
    </>
  )
}
