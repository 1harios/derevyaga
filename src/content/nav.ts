export type NavItem = {
  href: string
  label: string
  description?: string
}

/** Шапка по референсу: четыре ссылки, остальное — в бургере и футере */
export const headerNav: NavItem[] = [
  { href: '/projects', label: 'Наши проекты' },
  { href: '/promotions', label: 'Акции' },
  { href: '/calculator', label: 'Калькулятор' },
  { href: '/contacts', label: 'Контакты' },
]

/** Полное меню: используется в бургере и футере */
export const mainNav: NavItem[] = [
  { href: '/projects', label: 'Проекты' },
  { href: '/promotions', label: 'Акции' },
  { href: '/calculator', label: 'Калькулятор' },
  { href: '/about', label: 'О компании' },
]

/** Остальные разделы — в бургер-меню и футер */
export const secondaryNav: NavItem[] = [
  { href: '/mortgage', label: 'Ипотека и рассрочка' },
  { href: '/guarantee', label: 'Гарантия и договор' },
  { href: '/reviews', label: 'Отзывы' },
  { href: '/faq', label: 'Вопросы и ответы' },
  { href: '/contacts', label: 'Контакты' },
]

import { cities } from './cities'

export const footerColumns: { title: string; items: NavItem[] }[] = [
  {
    title: 'Дома',
    items: [
      { href: '/projects', label: 'Каталог проектов' },
      { href: '/promotions', label: 'Акции' },
      { href: '/calculator', label: 'Калькулятор' },
    ],
  },
  {
    title: 'Компания',
    items: [
      { href: '/about', label: 'О компании' },
      { href: '/reviews', label: 'Отзывы' },
    ],
  },
  {
    title: 'Клиентам',
    items: [
      { href: '/guarantee', label: 'Гарантия и договор' },
      { href: '/mortgage', label: 'Ипотека и маткапитал' },
      { href: '/faq', label: 'Вопросы и ответы' },
      { href: '/contacts', label: 'Контакты' },
      { href: '/lk', label: 'Личный кабинет' },
    ],
  },
  {
    title: 'Строим в области',
    items: cities.map((city) => ({
      href: `/karkasnye-doma/${city.slug}`,
      label: city.name,
    })),
  },
]
