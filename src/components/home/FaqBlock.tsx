import { Accordion, AccordionItem } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { faqItems } from '@/content/faq'

export function FaqBlock() {
  return (
    <Section id="faq">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2>В том числе неудобные</h2>
          <p className="lead mt-4">
            Если вопрос звучит неприятно для подрядчика, это не повод его прятать. Здесь ответы
            на те, которые чаще всего задают после третьей встречи.
          </p>
          <div className="mt-6">
            <Button href="/faq" variant="outline" arrow>
              Все вопросы
            </Button>
          </div>
        </div>

        <Accordion>
          {faqItems.map((item, index) => (
            <AccordionItem key={item.question} question={item.question} defaultOpen={index === 0}>
              {item.answer}
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  )
}
