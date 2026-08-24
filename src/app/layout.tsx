import type { Metadata, Viewport } from 'next'
import { AmoChatWidget } from '@/components/layout/AmoChatWidget'
import { CookieBanner } from '@/components/layout/CookieBanner'
import { Footer } from '@/components/layout/Footer'
import { RevealObserver } from '@/components/layout/RevealObserver'
import { StickyHeader } from '@/components/layout/StickyHeader'
import { StickyCta } from '@/components/ui/StickyCta'
import { company } from '@/content/company'
import './globals.css'
import { siteUrl } from '@/lib/site-url'

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
  robots: { index: true, follow: true },
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
        {/* Класс js-reveal включает скрытие data-reveal-элементов ДО первой
            отрисовки — иначе контент мигал бы. Без JavaScript класс не ставится
            и всё остаётся видимым. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js-reveal')",
          }}
        />
      </head>
      <body>
        <RevealObserver />
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