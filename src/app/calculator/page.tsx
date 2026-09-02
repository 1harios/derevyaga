import type { Metadata } from 'next'
import { QuizCalculator } from '@/components/home/QuizCalculator'
import { PageHero } from '@/components/layout/PageHero'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { promises } from '@/content/company'
import { pricing } from '@/lib/pricing/pricing.config'

export const metadata: Metadata = {
  title: 'Калькулятор стоимости каркасного дома',
  description:
    'Посчитайте каркасный дом за две минуты: площадь, комплектация, фундамент, кровля и участок. Диапазон цены, срок стройки и график платежей — сразу, без звонка менеджера.',
  alternates: { canonical: '/calculator' },
}

/** Как устроен расчёт — честные ответы вместо «магии» */
const notes = [
  {
    title: 'Считает те же цифры, что и сметчик',
    text: 'Калькулятор читает рабочий файл цен компании: ставки за м² по комплектациям и коэффициенты за фундамент, кровлю, фасад и утепление. Это не маркетинговая цифра «от», к которой потом прибавляют всё подряд.',
  },
  {
    title: `Диапазон ±${Math.round(pricing.spread * 100)}%, а не точная цена`,
    text: 'До выезда на участок честнее показывать вилку: итог зависит от грунтов, подъезда и перепада высот. Точную цифру фиксируем в договоре после бесплатного замера — и дальше она не меняется.',
  },
  {
    title: 'Телефон — только в конце и только по желанию',
    text: 'Весь расчёт работает без регистрации. Номер понадобится, если захотите подробную смету в PDF: состав работ по этапам, график платежей и список того, что в цену не входит.',
  },
]

export default function CalculatorPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Калькулятор' }]}
        title="Посчитайте свой дом за две минуты"
        lead={
          <>
            Четыре шага: дом, комплектация, основание и участок. Цена пересчитывается{' '}
            <strong>сразу, без ожидания менеджера</strong> — в конце покажем диапазон,
            срок стройки и график платежей по этапам.
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <span className="chip bg-surface">без регистрации</span>
          <span className="chip bg-surface">первые {pricing.distance.freeKm} км от КАД включены</span>
          <span className="chip bg-surface">график платежей по {pricing.paymentSchedule.length} этапам</span>
        </div>
      </PageHero>

      {/* Квиз рендерится на сервере целиком: параметры предзаполнения он читает
          после монтирования, поэтому Suspense-заглушка (и сдвиг страницы) не нужны */}
      <QuizCalculator showIntro={false} />

      <Section compact>
        {/* Заголовок уровня секции для порядка h2 → h3; карточки говорят сами за себя */}
        <h2 className="sr-only">Как устроен расчёт</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {notes.map((note) => (
            <div key={note.title} className="card rounded-xl p-6">
              <h3 className="text-[16px]">{note.title}</h3>
              <p className="mt-2.5 text-[14px] leading-[1.6] muted">{note.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-col items-start justify-between gap-5 rounded-xl bg-panel p-6 md:flex-row md:items-center md:p-7">
          <p className="max-w-2xl text-[15px] leading-[1.6]">
            Хотите понять, из чего складываются ставки за м² и что двигает цену вверх
            и вниз? Разобрали всё по полочкам на странице цен — с примерами смет.
          </p>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button href="/prices" variant="outline" arrow>
              Как устроены цены
            </Button>
            <Button href="/complectations" variant="outline">
              Состав комплектаций
            </Button>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-[13px] leading-[1.6] muted">
          Расчёт предварительный и не является публичной офертой. Точная стоимость
          фиксируется в договоре после бесплатного выезда замерщика — смета готова
          за {promises.estimateDays} рабочих дня.
        </p>
      </Section>
    </>
  )
}
