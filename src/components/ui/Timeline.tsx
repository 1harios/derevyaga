import { stages } from '@/content/stages'
import { pluralized } from '@/lib/utils'

/** Этапы стройки: карточки-плитки со сроком и платежом */
export function StagesTimeline() {
  return (
    <ol className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      {stages.map((stage) => (
        <li key={stage.index} className="card flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="chip">Этап {stage.index}</span>
            <span className="num text-[15px]">
              {pluralized(stage.days, ['день', 'дня', 'дней'])}
            </span>
          </div>

          <h3 className="text-[17px]">{stage.name}</h3>
          <p className="text-[14px] leading-[1.55] muted">{stage.description}</p>

          <p className="mt-auto pt-3 text-[13px] muted">{stage.payment}</p>
        </li>
      ))}
    </ol>
  )
}
