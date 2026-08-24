import { Section, SectionHeader } from '@/components/ui/Section'
import { StagesTimeline } from '@/components/ui/Timeline'
import { totalDays } from '@/content/stages'

/** Три шага до дома — верхний ряд, как в референсе, дальше подробный таймлайн */
const steps = [
  {
    number: 1,
    title: 'Консультация и проект',
    text: 'Обсуждаем участок, планировку и бюджет, считаем смету и фиксируем её в договоре вместе с датой сдачи.',
  },
  {
    number: 2,
    title: 'Строительство',
    text: 'Бригада работает по графику этапов, каждые 7 дней выкладывает фотоотчёт в личный кабинет.',
  },
  {
    number: 3,
    title: 'Завершение и отделка',
    text: 'Принимаем работы по чек-листу из 74 пунктов, устраняем замечания и передаём документы.',
  },
]

export function StagesBlock() {
  return (
    <Section id="stages">
      <SectionHeader
        align="center"
        eyebrow="Как идёт стройка"
        title="Три шага до нового дома"
        description={`Восемь рабочих этапов, ${totalDays} дня от подписания до ключей. Пока вы не приняли этап, следующий платёж не начисляется.`}
      />

      <ol className="mb-3 grid gap-3 md:grid-cols-3">
        {steps.map((step) => (
          <li key={step.number} className="card flex gap-5 p-6">
            <span
              aria-hidden
              className="num flex size-12 shrink-0 items-center justify-center rounded-full bg-panel text-[18px]"
            >
              {step.number}
            </span>
            <div>
              <h3 className="text-[17px]">{step.title}</h3>
              <p className="mt-2 text-[14px] leading-[1.55] muted">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <StagesTimeline />

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {[
          {
            title: 'Срок в договоре, а не «ориентировочно»',
            text: 'За просрочку по нашей вине — пеня 0,1% от суммы этапа за каждый день.',
          },
          {
            title: 'Задержки показываем сразу',
            text: 'Этап сдвинулся — видите это в кабинете в тот же день, вместе с причиной и новой датой.',
          },
          {
            title: 'Фотоотчёт каждые 7 дней',
            text: 'И обязательно перед зашивкой скрытых работ, чтобы потом не верить на слово.',
          },
        ].map((item) => (
          <div key={item.title} className="rounded-lg bg-panel p-5">
            <h3 className="text-[16px]">{item.title}</h3>
            <p className="mt-2 text-[14px] leading-[1.55] muted">{item.text}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
