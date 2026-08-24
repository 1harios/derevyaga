import type { Metadata } from 'next'
import { FinalCta } from '@/components/home/FinalCta'
import { PageHero } from '@/components/layout/PageHero'
import { Accordion, AccordionItem } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { company } from '@/content/company'
import { faqCategories, faqItems } from '@/content/faq'
import { telHref } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Вопросы и ответы — в том числе неудобные',
  description:
    'Что будет при срыве срока, может ли вырасти смета, что не входит в цену и что реально покрывает гарантия. Отвечаем на вопросы, которые обычно задают после третьей встречи.',
  alternates: { canonical: '/faq' },
}

export default function FaqPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Вопросы и ответы' }]}
        title="Вопросы, в том числе неудобные"
        lead={
          <>
            Если вопрос звучит неприятно для подрядчика — это не повод его прятать.
            Здесь ответы на те, что <strong>чаще всего задают после третьей встречи</strong>:
            про деньги, сроки, простои и гарантию.
          </>
        }
      >
        {/* Якорная навигация по группам */}
        <div className="flex flex-wrap gap-2">
          {faqCategories.map((category) => (
            <a key={category.id} href={`#${category.id}`} className="chip bg-surface transition-colors duration-200 ease-out hover:bg-dark hover:text-white">
              {category.title}
            </a>
          ))}
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-12">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-[clamp(1.2rem,1.05rem+0.6vw,1.5rem)]">
              Не нашли свой вопрос?
            </h2>
            <p className="mt-3 text-[15px] leading-[1.65] muted">
              Спросите напрямую — отвечает не колл-центр, а менеджер, который ведёт
              объекты. Неудобные вопросы любим больше остальных.
            </p>
            <div className="mt-5 flex flex-col items-start gap-2">
              <Button href={telHref(company.phone)} variant="outline" size="sm">
                {company.phone}
              </Button>
              <Button href={company.telegram} variant="outline" size="sm">
                Написать в Telegram
              </Button>
            </div>
          </div>

          <div className="space-y-10">
            {faqCategories.map((category) => {
              const items = faqItems.filter((item) => item.category === category.id)
              if (items.length === 0) return null

              return (
                <div key={category.id} id={category.id} className="scroll-mt-24">
                  <p className="caption mb-4">{category.title}</p>
                  <Accordion>
                    {items.map((item, index) => (
                      <AccordionItem
                        key={item.question}
                        question={item.question}
                        defaultOpen={category.id === faqCategories[0].id && index === 0}
                      >
                        {item.answer}
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )
            })}
          </div>
        </div>
      </Section>

      <FinalCta
        formType="faq"
        title="Остался вопрос — зададите его лично"
        lead={
          <>
            Оставьте телефон: перезвоним, ответим на вопросы и, если захотите,
            посчитаем смету. <strong>Продавать в лоб не будем</strong> — после разговора
            решение всё равно за вами.
          </>
        }
      />
    </>
  )
}
