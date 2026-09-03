import type { Metadata } from 'next'
import { FinalCta } from '@/components/home/FinalCta'
import { MortgageBlock } from '@/components/home/MortgageBlock'
import { PageHero } from '@/components/layout/PageHero'
import { Section, SectionHeader } from '@/components/ui/Section'
import { promises } from '@/content/company'

export const metadata: Metadata = {
  title: 'Ипотека, маткапитал и рассрочка на каркасный дом',
  description:
    'Строим по ипотеке на ИЖС, принимаем материнский капитал и даём рассрочку по этапам без процентов. Смета в форме банка — за 2 рабочих дня. Калькулятор ежемесячного платежа.',
  alternates: { canonical: '/mortgage' },
}

/** Порядок оформления ипотеки на ИЖС с нами — по шагам */
const steps = [
  {
    number: 1,
    title: 'Выбираете проект и получаете смету',
    text: `Считаем смету за ${promises.estimateDays} рабочих дня и сразу готовим комплект для банка: договор подряда, смету в его форме и график работ.`,
  },
  {
    number: 2,
    title: 'Банк одобряет объект',
    text: 'Подаёте документы сами или через нашего менеджера — он знает требования банков к ИЖС и заранее закрывает типовые вопросы, из-за которых заявки заворачивают.',
  },
  {
    number: 3,
    title: 'Деньги приходят траншами',
    text: 'Банк перечисляет оплату по этапам на расчётный счёт компании — это ложится в наш обычный график платежей. Наличные нигде не участвуют.',
  },
  {
    number: 4,
    title: 'Стройка и отчёт перед банком',
    text: 'Фотоотчёты из личного кабинета подходят и банку: подтверждаем целевое использование без лишних выездов оценщика.',
  },
]

/** Частые вопросы про деньги — коротко, без юридического тумана */
const moneyFaq = [
  {
    question: 'Можно ли совместить маткапитал с ипотекой?',
    answer: 'Да, маткапитал чаще всего идёт в первоначальный взнос. Часть суммы приходит после подтверждения работ — это учтено в графике платежей.',
  },
  {
    question: 'Что, если банк не одобрит?',
    answer: 'Аванс за подготовку банковского комплекта не берём: не одобрили — вы ничего не потеряли. Поможем подать в другой банк, у них разные требования к ИЖС.',
  },
  {
    question: 'Рассрочка — это кредит?',
    answer: 'Нет. Это наш обычный график: платите за принятые этапы, без процентов и посредников. Просто последний платёж можно растянуть по договорённости.',
  },
]

export default function MortgagePage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Ипотека и рассрочка' }]}
        title="Дом в ипотеку, с маткапиталом или в рассрочку"
        lead={
          <>
            Работаем со всеми способами оплаты ИЖС: <strong>ипотека, материнский капитал,
            рассрочка по этапам</strong> и обычный безнал. Документы для банка готовим сами —
            за {promises.estimateDays} рабочих дня.
          </>
        }
      />

      <MortgageBlock />

      <Section>
        <SectionHeader
          title="Как проходит стройка в ипотеку"
          description="От заявки до сдачи — те же этапы, что и при обычной оплате, плюс банк в роли плательщика."
        />
        <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step) => (
            <li key={step.number} className="card flex flex-col rounded-xl p-6">
              <span
                aria-hidden
                className="num flex size-12 shrink-0 items-center justify-center rounded-full bg-panel text-[18px]"
              >
                {step.number}
              </span>
              <h3 className="mt-4 text-[16px]">{step.title}</h3>
              <p className="mt-2 text-[14px] leading-[1.6] muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section compact>
        {/* Заголовок уровня секции нужен для порядка h2 → h3; визуально карточки говорят сами за себя */}
        <h2 className="sr-only">Частые вопросы про оплату</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {moneyFaq.map((item) => (
            <div key={item.question} className="rounded-xl bg-panel p-6">
              <h3 className="text-[16px]">{item.question}</h3>
              <p className="mt-2.5 text-[14px] leading-[1.6] muted">{item.answer}</p>
            </div>
          ))}
        </div>
      </Section>

      <FinalCta
        formType="mortgage"
        title="Подберём программу под вашу ситуацию"
        lead={
          <>
            Расскажите про участок и бюджет — посчитаем смету, подскажем, под какую
            программу вы проходите, и <strong>подготовим комплект для банка бесплатно</strong>.
          </>
        }
      />
    </>
  )
}
