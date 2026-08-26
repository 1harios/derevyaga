/**
 * Данные компании. Всё, что помечено ЗАМЕНИТЬ, — заглушка из брифа.
 * Полный список незаполненного лежит в DATA_TODO.md в корне проекта.
 */

export const company = {
  name: 'Деревяга',
  tagline: 'Каркасные дома',
  city: 'Санкт-Петербург',
  cityPrepositional: 'Санкт-Петербурге',
  region: 'Ленинградская область',

  // ЗАМЕНИТЬ: реальные контакты
  phone: '+7 (812) 000-00-00',
  email: 'info@derevyaga.example',
  telegram: 'https://t.me/derevyaga',
  vk: 'https://vk.com/derevyaga',
  whatsapp: 'https://wa.me/78120000000',
  address: 'Санкт-Петербург, ЗАМЕНИТЬ: улица, дом, офис',
  workHours: 'Пн–Сб, 9:00–20:00',
  mapUrl: 'https://yandex.ru/maps/',

  // ЗАМЕНИТЬ: реквизиты юридического лица
  legal: {
    fullName: 'ЗАМЕНИТЬ: ООО «Деревяга»',
    inn: 'ЗАМЕНИТЬ: ИНН',
    ogrn: 'ЗАМЕНИТЬ: ОГРН',
    legalAddress: 'ЗАМЕНИТЬ: юридический адрес',
    dataOfficer: 'ЗАМЕНИТЬ: ответственный за обработку персональных данных',
  },
} as const

/**
 * Ключевые доказательства. Повторяются по всему сайту, поэтому живут в одном месте.
 * ЗАМЕНИТЬ: все четыре цифры — заглушки из брифа.
 */
export const stats = [
  { value: '218', label: 'домов сдано', note: 'с 2011 года' },
  { value: '5 лет', label: 'гарантия по договору', note: 'на конструктив' },
  { value: '0 ₽', label: 'доплат сверх сметы', note: 'цена фиксируется' },
  { value: '15 лет', label: 'на рынке', note: 'своя бригада' },
] as const

/** Обещания, которые повторяются в шапке, футере и формах */
export const promises = {
  buildDays: 94,
  guaranteeYears: 5,
  estimateDays: 2,
  photoReportEveryDays: 7, // ЗАМЕНИТЬ: частота фотоотчётов
  objectsBuilt: 218, // ЗАМЕНИТЬ
  yearsOnMarket: 15, // ЗАМЕНИТЬ
  insulationMm: 200, // ЗАМЕНИТЬ
  startingPrice: 4_850_000, // ЗАМЕНИТЬ
  startingArea: 132, // ЗАМЕНИТЬ
} as const

export const legalLinks = [
  { href: '/legal/privacy', label: 'Политика обработки персональных данных' },
  { href: '/legal/consent', label: 'Согласие на обработку персональных данных' },
  { href: '/legal/cookie', label: 'Политика cookie' },
] as const
