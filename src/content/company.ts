
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

  // Контакты: городской номер — основной на сайте, мобильный — для WhatsApp и второй линии
  phone: '+7 (812) 385-01-00',
  phoneMobile: '+7 (993) 077-78-08',
  email: 'ooombk88@mail.ru',
  // Подтверждённые ссылки на мессенджеры и площадки компании.
  telegram: 'https://t.me/derevyaga',
  vk: 'https://vk.ru/skderevyaga',
  max: 'https://max.ru/join/4Fr75hQgcYNks7rPrwEPtl6BL8SEbaHj6CJdb-SpsHo',
  avito: 'https://www.avito.ru/brands/4da0042cc3569967f507966354df2602/all/predlozheniya_uslug?gdlkerfdnwq=101&page_from=from_item_card&iid=8237957822&sellerId=023842933550c54cfa820e68b43abbaf',
  whatsapp: 'https://wa.me/79930777808',
  address: 'Санкт-Петербург, ул. Разъезжая, д. 44, литера И, офис 11Н',
  workHours: 'Пн–Сб, 9:00–20:00',
  mapUrl: 'https://yandex.by/maps/-/CTtWeQPD',

  // Реквизиты юридического лица — из раздела «Реквизиты сторон» договора подряда
  legal: {
    fullName: 'ООО «МБК»',
    inn: '7840101198',
    kpp: '784001001',
    legalAddress: '191119, Санкт-Петербург, ул. Разъезжая, д. 44, литера И, офис 11Н',
    // Оператор персональных данных — само юридическое лицо
    dataOfficer: 'ООО «МБК»',
    bank: {
      account: '40702810832410008944',
      name: 'Филиал «Санкт-Петербургский» АО «Альфа-Банк»',
      bik: '044030786',
      corrAccount: '30101810600000000786',
    },
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

/**
 * Единая пара призывов к действию по всему сайту: первичный ведёт к форме
 * заявки (#final-form), вторичный — в каталог. Раньше одно действие называлось
 * по-разному («Рассчитать проект», «Оставить заявку», «Рассчитать дом»).
 */
export const cta = {
  primary: 'Заказать звонок',
  secondary: 'Каталог проектов',
} as const

export const legalLinks = [
  { href: '/legal/privacy', label: 'Политика обработки персональных данных' },
  { href: '/legal/consent', label: 'Согласие на обработку персональных данных' },
  { href: '/legal/cookie', label: 'Политика cookie' },
] as const
