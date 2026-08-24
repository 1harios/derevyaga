/**
 * ЕДИНЫЙ ФАЙЛ ЦЕН. Правится менеджером без разработчика.
 *
 * ВНИМАНИЕ: все цифры ниже — заглушки, проставленные по рынку Санкт-Петербурга,
 * их нужно заменить на реальные ставки компании. После правки ничего
 * пересобирать вручную не надо: и квиз на главной, и полный калькулятор
 * читают этот файл.
 *
 * Логика: базовая цена за м² зависит от комплектации, дальше применяются
 * коэффициенты (этажность, фундамент, кровля, фасад, утепление, окна),
 * затем добавляются надбавки за инженерию, террасу и удалённость.
 */

export const pricing = {
  /** Базовая цена за м² по комплектациям, ₽. ЗАМЕНИТЬ на реальные. */
  basePerM2: {
    frame: 38_000, // каркас под отделку
    prefinish: 52_000, // под чистовую отделку
    turnkey: 68_000, // под ключ
  },

  /** Коэффициент этажности: у двух этажей дешевле м² — общий фундамент и кровля */
  floors: {
    '1': 1.0,
    '1.5': 0.96, // мансарда
    '2': 0.94,
  },

  foundation: {
    piles: 1.0, // свайно-винтовой
    strip: 1.06, // ленточный
    slab: 1.12, // монолитная плита
  },

  roof: {
    metal: 1.0, // металлочерепица
    soft: 1.03, // гибкая черепица
    seam: 1.09, // фальцевая
  },

  facade: {
    imitation: 1.0, // имитация бруса
    planken: 1.05, // планкен
    plaster: 1.08, // штукатурка по системе
  },

  /** Толщина утепления стен, мм */
  insulation: {
    '150': 0.98,
    '200': 1.0,
    '250': 1.03,
  },

  windows: {
    standard: 1.0,
    enlarged: 1.04, // увеличенные окна
  },

  /**
   * Инженерия — надбавка за м², ₽. В комплектации «под ключ» базовая
   * инженерия уже входит в цену, поэтому для неё базовый вариант = 0.
   */
  engineeringPerM2: {
    none: 0,
    basic: 3_500,
    full: 6_500,
  },

  /** Терраса, ₽ за м² её площади */
  terracePerM2: 22_000,

  /** Логистика: первые 50 км от города включены, дальше берём за километр */
  distance: {
    freeKm: 50,
    pricePerKm: 1_200,
    maxKm: 300,
  },

  /** Разброс итоговой цены: показываем «от и до», а не одну цифру */
  spread: 0.07,

  /** Сроки: база в днях плюс дни на каждый м², с поправкой на комплектацию */
  duration: {
    baseDays: 46,
    daysPerM2: 0.28,
    completenessFactor: {
      frame: 0.55,
      prefinish: 0.8,
      turnkey: 1.0,
    },
    floorsFactor: {
      '1': 1.0,
      '1.5': 1.08,
      '2': 1.14,
    },
  },

  /** График платежей по этапам, доля от суммы договора. Сумма должна быть 1. */
  paymentSchedule: [
    { stage: 'Договор и проект', share: 0.1 },
    { stage: 'Фундамент', share: 0.15 },
    { stage: 'Каркас и перекрытия', share: 0.2 },
    { stage: 'Кровля', share: 0.12 },
    { stage: 'Окна и фасад', share: 0.13 },
    { stage: 'Инженерия', share: 0.1 },
    { stage: 'Отделка', share: 0.12 },
    { stage: 'Сдача объекта', share: 0.08 },
  ],
} as const

export type Completeness = keyof typeof pricing.basePerM2
export type FloorsOption = keyof typeof pricing.floors
export type FoundationOption = keyof typeof pricing.foundation
export type RoofOption = keyof typeof pricing.roof
export type FacadeOption = keyof typeof pricing.facade
export type InsulationOption = keyof typeof pricing.insulation
export type WindowsOption = keyof typeof pricing.windows
export type EngineeringOption = keyof typeof pricing.engineeringPerM2
