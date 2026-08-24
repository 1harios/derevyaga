export type NavItem = {
  href: string
  label: string
  description?: string
}

/** Шапка по референсу: четыре ссылки, остальное — в бургере и футере */
export const headerNav: NavItem[] = [
  { href: '/projects', label: 'Наши проекты' },
  { href: '/technology', label: 'Технология' },
  { href: '/objects', label: 'Объекты' },
  { href: '/contacts', label: 'Контакты' },
]

/** Полное меню: используется в бургере и футере */
export const mainNav: NavItem[] = [
  { href: '/projects', label: 'Проекты' },
  { href: '/complectations', label: 'Комплектации' },
  { href: '/technology', label: 'Технология' },
  { href: '/objects', label: 'Объекты' },
  { href: '/prices', label: 'Цены' },
  { href: '/about', label: 'О компании' },
]

/** Остальные разделы — в бургер-меню и футер */
export const secondaryNav: NavItem[] = [
  { href: '/calculator', label: 'Калькулятор' },
  { href: '/mortgage', label: 'Ипотека и рассрочка' },
  { href: '/guarantee', label: 'Гарантия и договор' },
  { href: '/reviews', label: 'Отзывы' },
  { href: '/faq', label: 'Вопросы и ответы' },
  { href: '/blog', label: 'Блог' },
  { href: '/vacancies', label: 'Вакансии для бригад' },
  { href: '/contacts', label: 'Контакты' },
]

import { cities } from './cities'

export const footerColumns: { title: string; items: NavItem[] }[] = [
  {
    title: 'Дома',
    items: [
      { href: '/projects', label: 'Каталог проектов' },
      { href: '/complectations', label: 'Комплектации' },
      { href: '/technology', label: 'Технология' },
      { href: '/prices', label: 'Цены' },
      { href: '/calculator', label: 'Калькулятор' },
    ],
  },
  {
    title: 'Компания',
    items: [
      { href: '/about', label: 'О компании и бригаде' },
      { href: '/objects', label: 'Построенные объекты' },
      { href: '/reviews', label: 'Отзывы' },
      { href: '/blog', label: 'Блог' },
      { href: '/vacancies', label: 'Вакансии' },
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
