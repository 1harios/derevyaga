import { constructorConfig } from '@/lib/constructor/config'
import type { ConstructorInput } from '@/lib/constructor/engine'

/**
 * Какая картинка показывается на каком шаге. Все кадры сделаны от одного
 * мастер-кадра, поэтому дом на них один и тот же — меняется только стадия
 * стройки и выбранные материалы. Файлы лежат в public/constructor.
 */

export type StepId = 'size' | 'foundation' | 'insulation' | 'roof' | 'facade' | 'terrace' | 'delivery'

export const STEPS: ReadonlyArray<{ id: StepId; title: string; short: string }> = [
  { id: 'size', title: 'Размер дома', short: 'Размер' },
  { id: 'foundation', title: 'Свайное поле', short: 'Сваи' },
  { id: 'insulation', title: 'Каркас и утепление', short: 'Каркас' },
  { id: 'roof', title: 'Кровля', short: 'Кровля' },
  { id: 'facade', title: 'Отделка фасада', short: 'Фасад' },
  { id: 'terrace', title: 'Терраса', short: 'Терраса' },
  { id: 'delivery', title: 'Доставка и монтаж', short: 'Доставка' },
]

const BASE = '/constructor'

export const stageImage = {
  plot: `${BASE}/stage-plot.webp`,
  frame: `${BASE}/stage-frame.webp`,
}

/** Свайное поле: винтовые или железобетонные сваи */
export function pilesImage(foundation: ConstructorInput['foundation']): string {
  return `${BASE}/stage-piles-${foundation}.webp`
}

export function roofImage(roof: ConstructorInput['roof']): string {
  return `${BASE}/roof-${roof}.webp`
}

export function houseImage(input: Pick<ConstructorInput, 'roof' | 'facade' | 'terrace'>): string {
  return `${BASE}/house-${input.roof}-${input.facade}-${input.terrace ? 'terrace' : 'plain'}.webp`
}

function label<T extends { id: string; label: string }>(list: readonly T[], id: string): string {
  return list.find((item) => item.id === id)?.label ?? ''
}

export type Visual = { src: string; alt: string; caption: string }

export function visualFor(step: StepId, input: ConstructorInput): Visual {
  const size = constructorConfig.sizes.find((item) => item.id === input.size) ?? constructorConfig.sizes[0]
  const roof = label(constructorConfig.roofs, input.roof)
  const facade = label(constructorConfig.facades, input.facade)
  const insulation = label(constructorConfig.insulation, input.insulation)

  switch (step) {
    case 'size':
      return {
        src: stageImage.plot,
        alt: 'Ровный участок с разметкой под дом',
        caption: size.id === 'custom' ? 'Участок под дом вашего размера' : `Участок размечен под дом ${size.label}`,
      }
    case 'foundation': {
      const foundation =
        constructorConfig.foundations.find((item) => item.id === input.foundation) ?? constructorConfig.foundations[0]
      return {
        src: pilesImage(input.foundation),
        alt: `${foundation.label} по разметке дома`,
        caption:
          size.id === 'custom'
            ? `${foundation.label} — количество посчитаем после замера`
            : `${size.piles} свай · ${foundation.short}`,
      }
    }
    case 'insulation':
      return {
        src: stageImage.frame,
        alt: 'Каркас стен и крыши из доски камерной сушки на свайном фундаменте',
        caption: `Каркас из доски камерной сушки, утепление ${insulation}`,
      }
    case 'roof':
      return {
        src: roofImage(input.roof),
        alt: `Каркас дома под кровлей: ${roof.toLowerCase()}`,
        caption: `Кровля: ${roof.toLowerCase()}`,
      }
    case 'facade':
      return {
        src: houseImage(input),
        alt: `Дом с фасадом «${facade}» и кровлей «${roof}»`,
        caption: `Фасад: ${facade.toLowerCase()}`,
      }
    case 'terrace':
      return {
        src: houseImage(input),
        alt: input.terrace ? 'Дом с открытой террасой вдоль фасада' : 'Дом без террасы, с крыльцом у входа',
        caption: input.terrace ? 'С террасой — входит в базовую цену' : 'Без террасы — компактнее и дешевле',
      }
    case 'delivery':
    default:
      return {
        src: houseImage(input),
        alt: `Готовый дом ${size.label}: ${facade.toLowerCase()}, ${roof.toLowerCase()}`,
        caption: `Дом готов — везём от посёлка ${constructorConfig.deliveryOrigin.replace('посёлок ', '')} и собираем за ${constructorConfig.buildDays} дней`,
      }
  }
}

/** Картинки, которые понадобятся на следующем шаге — подгружаем заранее */
export function imagesForStep(step: StepId, input: ConstructorInput): string[] {
  switch (step) {
    case 'size':
      return [stageImage.plot]
    case 'foundation':
      return constructorConfig.foundations.map((item) => pilesImage(item.id))
    case 'insulation':
      return [stageImage.frame]
    case 'roof':
      return constructorConfig.roofs.map((roof) => roofImage(roof.id))
    case 'facade':
      return constructorConfig.facades.map((facade) => houseImage({ ...input, facade: facade.id }))
    case 'terrace':
      return [houseImage({ ...input, terrace: true }), houseImage({ ...input, terrace: false })]
    case 'delivery':
    default:
      return [houseImage(input)]
  }
}
