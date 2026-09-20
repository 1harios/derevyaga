import { constructorConfig } from '@/lib/constructor/config'
import type { ConstructorInput } from '@/lib/constructor/engine'
import { plural } from '@/lib/utils'

export type StepId = 'size' | 'foundation' | 'insulation' | 'roof' | 'facade' | 'terrace' | 'delivery'

export const STEPS: ReadonlyArray<{ id: StepId; title: string; short: string; hint: string }> = [
  { id: 'size', title: 'Размер дома', short: 'Размер', hint: 'Выберите габариты — модель изменит пропорции. Размеры по общему контуру, включая террасу.' },
  { id: 'foundation', title: 'Свайное поле', short: 'Сваи', hint: 'Первым появляется фундамент. Количество свай в модели соответствует выбранному размеру и расчёту.' },
  { id: 'insulation', title: 'Каркас и утепление', short: 'Каркас', hint: 'Обвязка, лаги, стойки и стропила из сухой доски. Открытый фрагмент стены показывает выбранную толщину утепления.' },
  { id: 'roof', title: 'Кровля', short: 'Кровля', hint: 'Накрываем каркас. Выберите материал — его цвет и рельеф сразу изменятся на доме.' },
  { id: 'facade', title: 'Отделка фасада', short: 'Фасад', hint: 'Добавляем обшивку, окна и дверь. Натуральное дерево, фирменный мох или планкен — сравните на модели.' },
  { id: 'terrace', title: 'Терраса', short: 'Терраса', hint: 'Завершаем дом настилом, стойками и продолжением общей кровли. Терраса входит в базовую цену.' },
  { id: 'delivery', title: 'Доставка и монтаж', short: 'Доставка', hint: 'Дом собран. Укажите расстояние от производства в посёлке Янино до участка — добавим доставку к расчёту.' },
]

function label<T extends { id: string; label: string }>(list: readonly T[], id: string) {
  return list.find((item) => item.id === id)?.label ?? ''
}

/** Text and accessibility descriptions use the same selection as the live geometry. */
export function visualFor(step: StepId, input: ConstructorInput) {
  const size = constructorConfig.sizes.find((item) => item.id === input.size) ?? constructorConfig.sizes[0]
  const sizeText = size.id === 'custom' ? '6×6 — пример для индивидуального проекта' : size.label
  const roof = label(constructorConfig.roofs, input.roof).toLowerCase()
  const facade = label(constructorConfig.facades, input.facade).toLowerCase()
  const foundation = constructorConfig.foundations.find((item) => item.id === input.foundation)!
  const captions: Record<StepId, string> = {
    size: size.id === 'custom' ? 'Индивидуальный размер · модель на примере 6×6' : `Контур ${size.label} м · ${size.area} м²`,
    foundation: size.id === 'custom' ? `${foundation.short} · количество по проекту` : `${size.piles} ${plural(size.piles, ['свая', 'сваи', 'свай'])} · ${foundation.short}`,
    insulation: `Каркас · утепление ${input.insulation} мм`,
    roof: `Кровля · ${roof}`,
    facade: `Фасад · ${facade}`,
    terrace: input.terrace ? 'Терраса под общей кровлей · в базовой цене' : 'Без террасы · крыльцо у входа',
    delivery: `Ваш дом ${size.id === 'custom' ? 'по индивидуальному проекту' : size.label} готов к расчёту доставки`,
  }
  return {
    caption: captions[step],
    alt: `Объёмная модель дома ${sizeText}. ${captions[step]}. ${step === 'roof' || step === 'facade' || step === 'terrace' || step === 'delivery' ? `Кровля: ${roof}.` : ''}`,
  }
}
