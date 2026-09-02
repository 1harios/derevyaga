import { constructorConfig, type SizeId } from '@/lib/constructor/config'
import type { ConstructorInput } from '@/lib/constructor/engine'

/**
 * Какая картинка показывается на каком шаге. У каждого размера дома свой набор
 * кадров (public/constructor/<размер>/…), сделанный правками одного мастер-кадра
 * этого размера, поэтому дом внутри набора один и тот же — меняется только стадия
 * стройки и выбранные материалы. Для «Другого» размера показываем набор 6×6.
 */

export type StepId = 'size' | 'foundation' | 'insulation' | 'roof' | 'facade' | 'terrace' | 'delivery'

export const STEPS: ReadonlyArray<{ id: StepId; title: string; short: string; hint: string }> = [
  {
    id: 'size',
    title: 'Размер дома',
    short: 'Размер',
    hint: 'Размеры — по внешнему контуру. От них зависят площадь, количество свай и цена.',
  },
  {
    id: 'foundation',
    title: 'Свайное поле',
    short: 'Сваи',
    hint: 'Винтовые сваи — быстрый монтаж в любой сезон, железобетонные — прочнее и долговечнее.',
  },
  {
    id: 'insulation',
    title: 'Каркас и утепление',
    short: 'Каркас',
    hint: 'Каркас из доски камерной сушки. Толщину утеплителя выбирают под сезон: лето, межсезонье или круглый год.',
  },
  {
    id: 'roof',
    title: 'Кровля',
    short: 'Кровля',
    hint: 'Материал определяет срок службы, шум под дождём и характер дома.',
  },
  {
    id: 'facade',
    title: 'Отделка фасада',
    short: 'Фасад',
    hint: 'Внешняя отделка — вид дома и уход за ним. Имитация бруса входит в базовую цену.',
  },
  {
    id: 'terrace',
    title: 'Терраса',
    short: 'Терраса',
    hint: 'Открытая терраса вдоль фасада под общей кровлей — в базовой цене. Без неё дом компактнее и дешевле.',
  },
  {
    id: 'delivery',
    title: 'Доставка и монтаж',
    short: 'Доставка',
    hint: 'Расстояние от производства в посёлке Янино до участка. Сборка уже входит в цену дома.',
  },
]

const BASE = '/constructor'

/** Размеры, для которых набор кадров уже отрисован; остальные пока показывают дом 6×6 */
export const READY_SIZES: ReadonlyArray<SizeId> = ['6x6']

export function hasOwnFrames(size: SizeId): boolean {
  return READY_SIZES.includes(size)
}

/** Папка кадров для размера; у «Другого» и ещё не отрисованных размеров — набор 6×6 */
export function sizeFolder(size: SizeId): string {
  return hasOwnFrames(size) ? size : '6x6'
}

/** Размеченный участок под дом */
export function plotImage(size: SizeId): string {
  return `${BASE}/${sizeFolder(size)}/stage-plot.webp`
}

/** Свайное поле: винтовые или железобетонные сваи */
export function pilesImage(size: SizeId, foundation: ConstructorInput['foundation']): string {
  return `${BASE}/${sizeFolder(size)}/stage-piles-${foundation}.webp`
}

/** Каркас стен и крыши без кровли и отделки */
export function frameImage(size: SizeId): string {
  return `${BASE}/${sizeFolder(size)}/stage-frame.webp`
}

/** Каркас под выбранной кровлей */
export function roofImage(size: SizeId, roof: ConstructorInput['roof']): string {
  return `${BASE}/${sizeFolder(size)}/roof-${roof}.webp`
}

/** Готовый дом: кровля × фасад × терраса */
export function houseImage(
  size: SizeId,
  input: Pick<ConstructorInput, 'roof' | 'facade' | 'terrace'>,
): string {
  return `${BASE}/${sizeFolder(size)}/house-${input.roof}-${input.facade}-${input.terrace ? 'terrace' : 'plain'}.webp`
}

/** Дом в базовой комплектации — для миниатюр в карточках размеров */
export function baseHouseImage(size: SizeId): string {
  return houseImage(size, { roof: 'ondulin', facade: 'timber', terrace: true })
}

function label<T extends { id: string; label: string }>(list: readonly T[], id: string): string {
  return list.find((item) => item.id === id)?.label ?? ''
}

export type Visual = {
  src: string
  alt: string
  caption: string
  /** Пометка в углу сцены, когда показан не тот дом, что выбран */
  note?: string
}

export function visualFor(step: StepId, input: ConstructorInput): Visual {
  const visual = visualByStep(step, input)
  const size = constructorConfig.sizes.find((item) => item.id === input.size) ?? constructorConfig.sizes[0]
  // Пока у размера нет своих кадров, честно помечаем, что показан дом 6×6
  return size.id !== 'custom' && !hasOwnFrames(size.id)
    ? { ...visual, caption: `${visual.caption} · кадры на примере 6×6`, note: 'кадры на примере дома 6×6' }
    : visual
}

function visualByStep(step: StepId, input: ConstructorInput): Visual {
  const size = constructorConfig.sizes.find((item) => item.id === input.size) ?? constructorConfig.sizes[0]
  const roof = label(constructorConfig.roofs, input.roof)
  const facade = label(constructorConfig.facades, input.facade)
  const insulation = label(constructorConfig.insulation, input.insulation)
  const sizeText = size.id === 'custom' ? 'вашего размера' : size.label

  switch (step) {
    case 'size':
      return {
        src: plotImage(input.size),
        alt: `Ровный участок с разметкой под дом ${sizeText}`,
        caption: size.id === 'custom' ? 'Участок под дом вашего размера' : `Участок размечен под дом ${size.label}`,
      }
    case 'foundation': {
      const foundation =
        constructorConfig.foundations.find((item) => item.id === input.foundation) ?? constructorConfig.foundations[0]
      return {
        src: pilesImage(input.size, input.foundation),
        alt: `${foundation.label} по разметке дома ${sizeText}`,
        caption:
          size.id === 'custom'
            ? `${foundation.label} — количество посчитаем после замера`
            : `${size.piles} свай · ${foundation.short}`,
      }
    }
    case 'insulation':
      return {
        src: frameImage(input.size),
        alt: `Каркас дома ${sizeText} из доски камерной сушки на свайном фундаменте`,
        caption: `Каркас из доски камерной сушки, утепление ${insulation}`,
      }
    case 'roof':
      return {
        src: roofImage(input.size, input.roof),
        alt: `Каркас дома ${sizeText} под кровлей: ${roof.toLowerCase()}`,
        caption: `Кровля: ${roof.toLowerCase()}`,
      }
    case 'facade':
      return {
        src: houseImage(input.size, input),
        alt: `Дом ${sizeText} с фасадом «${facade}» и кровлей «${roof}»`,
        caption: `Фасад: ${facade.toLowerCase()}`,
      }
    case 'terrace':
      return {
        src: houseImage(input.size, input),
        alt: input.terrace
          ? `Дом ${sizeText} с открытой террасой вдоль фасада`
          : `Дом ${sizeText} без террасы, с крыльцом у входа`,
        caption: input.terrace ? 'С террасой — входит в базовую цену' : 'Без террасы — компактнее и дешевле',
      }
    case 'delivery':
    default:
      return {
        src: houseImage(input.size, input),
        alt: `Готовый дом ${sizeText}: ${facade.toLowerCase()}, ${roof.toLowerCase()}`,
        caption: `Дом готов — везём от посёлка ${constructorConfig.deliveryOrigin.replace('посёлок ', '')} и собираем за ${constructorConfig.buildDays} дней`,
      }
  }
}

/** Картинки, которые понадобятся на этом шаге при смене выбора — подгружаем заранее */
export function imagesForStep(step: StepId, input: ConstructorInput): string[] {
  const size = input.size
  switch (step) {
    case 'size':
      // Смена размера меняет участок сразу — держим наготове участки всех размеров
      return constructorConfig.sizes.filter((item) => item.id !== 'custom').map((item) => plotImage(item.id))
    case 'foundation':
      return constructorConfig.foundations.map((item) => pilesImage(size, item.id))
    case 'insulation':
      return [frameImage(size)]
    case 'roof':
      return constructorConfig.roofs.map((roof) => roofImage(size, roof.id))
    case 'facade':
      return constructorConfig.facades.map((facade) => houseImage(size, { ...input, facade: facade.id }))
    case 'terrace':
      return [houseImage(size, { ...input, terrace: true }), houseImage(size, { ...input, terrace: false })]
    case 'delivery':
    default:
      return [houseImage(size, input)]
  }
}
