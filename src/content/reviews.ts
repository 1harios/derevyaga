export type Review = {
  id: string
  author: string
  meta: string
  text: string
  photo: string
  photoAlt: string
  rating: number
}

/** ЗАМЕНИТЬ: реальные отзывы с согласием на публикацию. Портреты временные. */
export const reviews: Review[] = [
  {
    id: 'pavlovy',
    author: 'Анна и Максим Павловы',
    meta: 'Ладога 132 м², Всеволожский район, 2025',
    text: 'Больше всего боялись, что после аванса нас перестанут слышать. В кабинете каждую неделю появлялись фото, а прораб отвечал в чате в тот же день. Один раз ошиблись с розетками в детской — переделали за свой счёт, спорить не пришлось.',
    photo: '/photos/otzyv-para.webp',
    photoAlt: 'Анна и Максим у своего дома',
    rating: 5,
  },
  {
    id: 'kuznetsov',
    author: 'Дмитрий Кузнецов',
    meta: 'Вуокса 118 м², Приозерский район, 2025',
    text: 'Сдали на девять дней позже из-за дождей. Написали об этом сами, до того как я заметил, и показали новый график. Смета при этом не выросла ни на рубль, хотя брус за это время подорожал.',
    photo: '/photos/otzyv-muzhchina.webp',
    photoAlt: 'Дмитрий на участке',
    rating: 4,
  },
  {
    id: 'sorokina',
    author: 'Елена Сорокина',
    meta: 'Сосновка 96 м², Токсово, 2024',
    text: 'Пришла с участком и потолком по бюджету 4,2 миллиона. Мне сразу сказали, что под ключ в эту сумму не уложимся, и предложили под чистовую с отделкой через год. Никто не пытался продать больше, чем я могу себе позволить.',
    photo: '/photos/otzyv-zhenshchina.webp',
    photoAlt: 'Елена у террасы дома',
    rating: 5,
  },
]

/** ЗАМЕНИТЬ: подставить реальные ролики и ссылку на карточку организации */
export const videoReviews = [
  {
    id: 'video-ladoga',
    title: 'Семья Павловых о стройке Ладоги 132',
    duration: '4:12',
    poster: '/photos/proekt-ladoga.webp',
    href: '#',
  },
  {
    id: 'video-kiviniemi',
    title: 'Илья показывает дом в Лосево через год после сдачи',
    duration: '6:38',
    poster: '/photos/proekt-kiviniemi.webp',
    href: '#',
  },
]

export const mapsRating = {
  value: 4.8,
  count: 63,
  source: 'Яндекс.Карты',
  href: 'https://yandex.ru/maps/', // ЗАМЕНИТЬ: ссылка на карточку организации
}
