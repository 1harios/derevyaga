export type BuiltObject = {
  slug: string
  name: string
  location: string
  area: number
  completeness: string
  plannedDays: number
  actualDays: number
  price: number
  year: number
  photoBefore: string
  photoBeforeAlt: string
  photoAfter: string
  photoAfterAlt: string
  quote: string
  author: string
  delayNote?: string
}

/** ЗАМЕНИТЬ: объекты, сроки, суммы и отзывы — заглушки. Фото временные. */
export const builtObjects: BuiltObject[] = [
  {
    slug: 'ladoga-vsevolozhsk',
    name: 'Ладога 132',
    location: 'Всеволожский район',
    area: 132,
    completeness: 'Под ключ',
    plannedDays: 94,
    actualDays: 91,
    price: 5_640_000,
    year: 2025,
    photoBefore: '/photos/obekt-ladoga-karkas.webp',
    photoBeforeAlt: 'Каркас двухэтажного дома с лесами на этапе сборки',
    photoAfter: '/photos/proekt-ladoga.webp',
    photoAfterAlt: 'Готовый двухэтажный дом 132 м² с террасой',
    quote:
      'Считали смету в трёх компаниях, у этих она оказалась не самой дешёвой, но единственной, где расписано до крепежа. Итог совпал с договором до рубля.',
    author: 'Сергей и Наталья, Всеволожский район',
  },
  {
    slug: 'vuoksa-priozersk',
    name: 'Вуокса 118',
    location: 'Приозерский район',
    area: 118,
    completeness: 'Под чистовую',
    plannedDays: 88,
    actualDays: 97,
    price: 5_100_000,
    year: 2025,
    photoBefore: '/photos/obekt-vuoksa-krovlya.webp',
    photoBeforeAlt: 'Дом с мансардой на этапе монтажа кровли',
    photoAfter: '/photos/proekt-vuoksa.webp',
    photoAfterAlt: 'Готовый дом с мансардой 118 м² и тёмным фасадом',
    delayNote: 'Задержка 9 дней: две недели дождей на этапе фасада, работы приостанавливали по технологии покраски.',
    quote:
      'Сроки сдвинулись из-за погоды, но нас предупредили заранее и показали в кабинете новый график. Неприятно, но честно — и без доплат.',
    author: 'Дмитрий, Приозерский район',
  },
  {
    slug: 'kiviniemi-losevo',
    name: 'Кивиниеми 145',
    location: 'Лосево',
    area: 145,
    completeness: 'Под ключ',
    plannedDays: 98,
    actualDays: 96,
    price: 6_320_000,
    year: 2024,
    photoBefore: '/photos/obekt-kiviniemi-svai.webp',
    photoBeforeAlt: 'Свайное поле и первые стены каркаса на участке у озера',
    photoAfter: '/photos/proekt-kiviniemi.webp',
    photoAfterAlt: 'Готовый одноэтажный дом 145 м² с панорамными окнами',
    quote:
      'Участок с валунами, я был уверен, что будут доплаты за фундамент. Пересчитали сваи на этапе проекта, в смете это уже было учтено.',
    author: 'Илья, Лосево',
  },
]
