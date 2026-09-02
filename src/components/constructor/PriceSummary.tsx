'use client'

import { Button } from '@/components/ui/Button'
import { constructorConfig } from '@/lib/constructor/config'
import { clampDistance, type ConstructorInput, type HouseEstimate } from '@/lib/constructor/engine'
import { formatPrice } from '@/lib/utils'
import type { StepId } from './visuals'

function Row({
  label,
  sub,
  value,
  onEdit,
}: {
  label: string
  sub: string
  value: number
  onEdit: () => void
}) {
  // Внутри <dl> допустимы только группы dt/dd (или div с ними без вложенных обёрток) —
  // поэтому строка сводки собрана сеткой: название, под ним пояснение, справа сумма
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4">
      <dt className="font-medium text-ink">{label}</dt>
      <dd className="num row-span-2 self-start text-[15px]">{formatPrice(value)}</dd>
      <dd className="col-start-1 mt-0.5 text-[13px] leading-snug text-ink-soft">
        {sub}
        {' · '}
        <button type="button" onClick={onEdit} className="link-underline text-ink-soft hover:text-ink">
          изменить
        </button>
      </dd>
    </div>
  )
}

/** Живой итог: три строки как в прайсе + «Итого с доставкой» и два действия */
export function PriceSummary({
  input,
  estimate,
  onEdit,
  onSave,
  onMortgage,
}: {
  input: ConstructorInput
  estimate: HouseEstimate
  onEdit: (step: StepId) => void
  onSave: () => void
  onMortgage: () => void
}) {
  if (estimate.custom) {
    return (
      <div className="card rounded-xl p-5 md:p-6">
        <p className="eyebrow mb-2">Другой размер</p>
        <h3 className="text-[18px]">Посчитаем индивидуально</h3>
        <p className="mt-2 text-[14px] leading-[1.55] text-ink-soft">
          Нестандартные размеры и планировки считаем по вашему эскизу за два рабочих дня — те же
          материалы и та же сборка за {constructorConfig.buildDays} дней.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={onSave} arrow>
            Отправить размеры
          </Button>
          <Button variant="outline" onClick={() => onEdit('size')}>
            Выбрать из линейки
          </Button>
        </div>
      </div>
    )
  }

  const size = constructorConfig.sizes.find((item) => item.id === input.size) ?? constructorConfig.sizes[0]
  const insulation = constructorConfig.insulation.find((item) => item.id === input.insulation)?.label ?? ''

  return (
    <div className="card rounded-xl p-5 md:p-6">
      <dl className="space-y-3.5 text-[14px]">
        <Row
          label={`Дом ${size.label} со сборкой`}
          sub={`${input.terrace ? 'терраса, ' : 'без террасы, '}утепление ${insulation}`}
          value={estimate.house}
          onEdit={() => onEdit('size')}
        />
        <Row
          label="Свайное поле"
          sub={`${estimate.piles.short} · ${estimate.piles.count} свай`}
          value={estimate.piles.price}
          onEdit={() => onEdit('foundation')}
        />
        <Row
          label="Доставка"
          sub={`от ${constructorConfig.deliveryOrigin.replace('посёлок ', 'п. ')} · ${clampDistance(input.distanceKm)} км`}
          value={estimate.delivery}
          onEdit={() => onEdit('delivery')}
        />
      </dl>

      <div className="mt-4 flex items-end justify-between gap-4 border-t border-line pt-4">
        <span className="text-[14px] text-ink-soft">Итого с доставкой</span>
        <span className="num text-[clamp(1.5rem,1.2rem+1vw,2rem)]">{formatPrice(estimate.total)}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={onSave} arrow>
          Сохранить расчёт
        </Button>
        <Button variant="outline" onClick={onMortgage}>
          Купить в ипотеку
        </Button>
      </div>
      <p className="mt-3 text-[12px] leading-[1.5] text-ink-soft">
        Расчёт предварительный: точную цену фиксируем в договоре после бесплатного замера.
      </p>
    </div>
  )
}
