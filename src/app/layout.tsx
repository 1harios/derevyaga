import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { AttributionTracker } from '@/components/layout/AttributionTracker'
import { AmoChatWidget } from '@/components/layout/AmoChatWidget'
import { CookieBanner } from '@/components/layout/CookieBanner'
import { Footer } from '@/components/layout/Footer'
import { RevealObserver } from '@/components/layout/RevealObserver'
import { StickyHeader } from '@/components/layout/StickyHeader'
import { YandexMetrika } from '@/components/layout/YandexMetrika'
import { StickyCta } from '@/components/ui/StickyCta'
import { company } from '@/content/company'
import './globals.css'
import { siteUrl } from '@/lib/site-url'

const isPreviewDomain = new URL(siteUrl).hostname.endsWith('.vercel.app')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Деревяга — каркасные дома под ключ в Санкт-Петербурге и Ленобласти',
    template: '%s — Деревяга',
  },
  description:
    'Строим каркасные дома под ключ за 94 дня. Фиксированная цена в договоре, гарантия 5 лет, личный кабинет с фотоотчётами. Расчёт сметы за 2 дня.',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: company.name,
    url: siteUrl,
    images: [{ url: '/brand/og-default.png', width: 1640, height: 856 }],
  },
  // Публичный Vercel-стенд содержит демонстрационные данные. Боевой домен
  // автоматически станет индексируемым после настройки NEXT_PUBLIC_SITE_URL.
  robots: { index: !isPreviewDomain, follow: true },
  alternates: { canonical: '/' },
}

export const viewport: Viewport = {
  themeColor: '#f1f0ee',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        {/* Предзагружаем только начертания первого экрана */}
        <link rel="preload" href="/fonts/onest-500-cyrillic.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/inter-400-cyrillic.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {/* Скрывающий класс js-reveal ставит RevealObserver после гидрации —
            и только для элементов ниже первого экрана. Первый экран виден
            с первой отрисовки, а без JavaScript видно вообще всё. */}
      </head>
      <body>
        <RevealObserver />
        <Suspense fallback={null}>
          <AttributionTracker />
        </Suspense>
        <YandexMetrika />
        <StickyHeader />
        <main id="main">{children}</main>
        <Footer />
        <StickyCta />
        <CookieBanner />
        <AmoChatWidget />
      </body>
    </html>
  )
}
