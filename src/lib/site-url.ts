/**
 * Публичный адрес сайта — единственное место, где он вычисляется.
 *
 * Порядок выбора:
 * 1. NEXT_PUBLIC_SITE_URL из окружения — боевой домен;
 * 2. на Vercel (тестовый стенд) — продакшен-домен проекта,
 *    который платформа отдаёт в VERCEL_PROJECT_PRODUCTION_URL;
 * 3. запасной вариант — derevyaga.ru.
 *
 * Сравнение через || вместо ??: пустая строка в переменной окружения
 * (частый случай при импорте списка переменных в хостинг) не должна
 * ронять сборку на new URL('').
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://derevyaga.ru')
