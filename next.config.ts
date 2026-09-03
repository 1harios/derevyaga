import type { NextConfig } from 'next'

/**
 * BUILD_TARGET=export собирает статическую копию сайта для показа вёрстки
 * без сервера. Боевая сборка идёт в standalone: так на Beget поднимается
 * один node-процесс без node_modules на хостинге. На Vercel (тестовый стенд)
 * output не задаём — платформа собирает своим таргетом, standalone ей мешает.
 */
const isStaticPreview = process.env.BUILD_TARGET === 'export'
const isVercel = Boolean(process.env.VERCEL)
const isProduction = process.env.NODE_ENV === 'production'

/**
 * Стартовая Content-Security-Policy. Пока отдаётся в режиме Report-Only:
 * ничего не блокирует, но браузер пишет в консоль всё, что нарушило бы
 * политику — так её можно обкатать на стенде и потом включить боевой заголовок.
 *
 * 'unsafe-inline' для скриптов нужен из-за JSON-LD и инлайнового js-reveal
 * в layout.tsx (следующий шаг — nonce через middleware). Домены amoCRM —
 * онлайн-чат (gso.amocrm.ru и поддомены), Яндекс — Метрика и карты.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://gso.amocrm.ru https://*.amocrm.ru https://mc.yandex.ru https://mc.yandex.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.amocrm.ru https://mc.yandex.ru https://mc.yandex.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.amocrm.ru wss://*.amocrm.ru https://mc.yandex.ru https://mc.yandex.com",
  "frame-src https://*.amocrm.ru https://mc.yandex.ru https://yandex.ru https://*.yandex.ru",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const nextConfig: NextConfig = {
  output: isStaticPreview ? 'export' : isVercel ? undefined : 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Только WebP: AVIF на этих битрейтах «замыливает» мелкую фактуру (трава, доски),
    // и Next кодирует его с пониженным качеством — кадры конструктора выглядели мыльными.
    formats: ['image/webp'],
    // Разрешённые значения quality у <Image>: 75 по умолчанию, 90 — для кадров конструктора
    qualities: [75, 90],
    // В статическом экспорте оптимизатор изображений недоступен:
    // отдаём заранее сжатые webp как есть.
    unoptimized: isStaticPreview,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          // В dev-режиме Next использует eval и инлайновые стили — там отчёты были бы шумом
          ...(isProduction
            ? [{ key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicy }]
            : []),
        ],
      },
      // Статика из public: сейчас Vercel отдаёт её с max-age=0. Шрифты меняются
      // только вместе с именем файла — кэшируем на год; фото и логотипы — на месяц
      // с фоновым обновлением, чтобы замена снимка под тем же именем дошла до всех.
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:folder(photos|brand|constructor)/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }],
      },
    ]
  },
}

export default nextConfig
