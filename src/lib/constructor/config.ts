/**
 * Конструктор дома: линейка размеров, опции, цены, ипотека, состав комплектации.
 *
 * Источник — прайс компании (расчёт комплектации): известны цена дома 6×6 со сборкой,
 * террасой и утеплением 100 мм (600 000 ₽), свайное поле 16 свай за 72 000 ₽ и точка
 * доставки — посёлок Янино. Всё, что помечено ЗАМЕНИТЬ, — оценка, выведенная
 * пропорционально площади или по рынку; заменить на цифры из прайса.
 *
 * Все цены в рублях, целые. Менять цены — только здесь.
 */

export type SizeId = '6x6' | '6x8' | '6x10' | '8x8' | '8x10' | 'custom'
export type InsulationId = '100' | '150' | '200'
export type RoofId = 'ondulin' | 'metal' | 'shingles'
export type FacadeId = 'timber' | 'painted' | 'planken'
export type MortgageProgramId = 'family' | 'standard'

export type SizeOption = {
  id: SizeId
  label: string
  /** Площадь по внешнему контуру, м² */
  area: number
  /** Дом со сборкой в базовой комплектации: терраса, утепление 100 мм, ондулин, имитация бруса */
  basePrice: number
  /** Винтовых свай под этот размер */
  piles: number
  note?: string
}

export type PricedOption<Id extends string> = {
  id: Id
  label: string
  note: string
  /** Надбавка к базовой цене за м² площади дома (0 — входит в базу) */
  pricePerM2: number
}

export const constructorConfig = {
  /** Откуда едет дом: производственная база */
  deliveryOrigin: 'посёлок Янино',
  buildDays: 25,

  sizes: [
    { id: '6x6', label: '6×6', area: 36, basePrice: 600_000, piles: 16, note: 'дача, гостевой дом' },
    { id: '6x8', label: '6×8', area: 48, basePrice: 790_000, piles: 20, note: 'две комнаты' }, // ЗАМЕНИТЬ: оценка по площади
    { id: '6x10', label: '6×10', area: 60, basePrice: 980_000, piles: 24, note: 'три комнаты' }, // ЗАМЕНИТЬ
    { id: '8x8', label: '8×8', area: 64, basePrice: 1_040_000, piles: 25, note: 'квадратный план' }, // ЗАМЕНИТЬ
    { id: '8x10', label: '8×10', area: 80, basePrice: 1_290_000, piles: 30, note: 'для семьи' }, // ЗАМЕНИТЬ
    { id: 'custom', label: 'Другой', area: 0, basePrice: 0, piles: 0, note: 'посчитаем индивидуально' },
  ] satisfies SizeOption[],

  /** Цена одной винтовой сваи с монтажом: 72 000 ₽ / 16 свай */
  pilePrice: 4_500,

  insulation: [
    { id: '100', label: '100 мм', note: 'в базовой цене · дача, лето и межсезонье', pricePerM2: 0 },
    { id: '150', label: '150 мм', note: 'тёплая осень и весна', pricePerM2: 900 }, // ЗАМЕНИТЬ
    { id: '200', label: '200 мм', note: 'круглогодичное проживание', pricePerM2: 1_700 }, // ЗАМЕНИТЬ
  ] satisfies PricedOption<InsulationId>[],

  roofs: [
    { id: 'ondulin', label: 'Ондулин', note: 'в базовой цене · лёгкий, тихий под дождём', pricePerM2: 0 },
    { id: 'metal', label: 'Металлочерепица', note: 'служит дольше, много цветов', pricePerM2: 700 }, // ЗАМЕНИТЬ
    { id: 'shingles', label: 'Мягкая черепица', note: 'самая тихая и герметичная', pricePerM2: 1_300 }, // ЗАМЕНИТЬ
  ] satisfies PricedOption<RoofId>[],

  facades: [
    { id: 'timber', label: 'Имитация бруса', note: 'в базовой цене · натуральное дерево', pricePerM2: 0 },
    { id: 'painted', label: 'Имитация бруса с покраской', note: 'фирменный мох, защита на годы', pricePerM2: 600 }, // ЗАМЕНИТЬ
    { id: 'planken', label: 'Планкен', note: 'современный фасад с зазором', pricePerM2: 1_900 }, // ЗАМЕНИТЬ
  ] satisfies PricedOption<FacadeId>[],

  /** Терраса входит в базовую цену; без неё дом дешевле на фиксированную сумму */
  terrace: { removeDiscount: 45_000 }, // ЗАМЕНИТЬ

  /** Доставка от Янино: подача техники + километры (100 км ≈ 25 000 ₽) */
  delivery: { base: 15_000, perKm: 100, maxKm: 400 }, // ЗАМЕНИТЬ

  mortgage: {
    programs: [
      {
        id: 'family',
        label: 'Семейная ипотека',
        rate: 6,
        note: 'Для семей с детьми — условия и лимит уточняет банк',
        highlight: true,
      },
      { id: 'standard', label: 'Обычная ипотека', rate: 19.6, note: 'Без ограничений по составу семьи', highlight: false },
    ] as Array<{ id: MortgageProgramId; label: string; rate: number; note: string; highlight: boolean }>,
    downPaymentDefaultPct: 25,
    downPaymentMinPct: 15,
    downPaymentMaxPct: 60,
    downPaymentStepPct: 5,
    termsYears: [5, 10, 15, 20, 25, 30],
    defaultTermYears: 20,
  },

  /** Состав базовой комплектации — как в прайсе */
  baseSpec: [
    { label: 'Каркас', value: 'доска камерной сушки 100×40, 1 сорт' },
    { label: 'Обвязка', value: 'брус 100×150, антисептированная' },
    { label: 'Отделка снаружи', value: 'имитация бруса' },
    { label: 'Отделка внутри', value: 'вагонка' },
    { label: 'Чистовой пол', value: 'ОСБ 22 мм' },
    { label: 'Окна ПВХ', value: '1000×800 — 3 шт, 500×500 — 1 шт' },
    { label: 'Входная дверь', value: 'Титан без утепления, 2000×860/960' },
    { label: 'Межкомнатные двери', value: 'каркасные' },
    { label: 'Перегородки', value: '2 шт по 3 метра' },
    { label: 'Высота потолка', value: '2,4 м' },
    { label: 'Высота конька', value: '1,5 м' },
    { label: 'Кровля', value: 'ондулин' },
    { label: 'Мембраны', value: 'ветро-влагозащита, пароизоляция' },
    { label: 'Утепление', value: '100 мм' },
  ],

  trust: [
    { title: 'Под ключ за 25 дней', text: 'после подписания договора' },
    { title: 'Без предоплаты', text: 'а также с семейной ипотекой и материнским капиталом' },
    { title: 'Своё производство', text: 'и собственные строительные бригады' },
  ],
} as const

export type ConstructorConfig = typeof constructorConfig
