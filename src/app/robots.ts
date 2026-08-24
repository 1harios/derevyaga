import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site-url'

/** Для статического превью (output: export) маршрут должен быть явно статическим */
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Служебное и без поискового смысла: API, кабинет, юридические заглушки
        disallow: ['/api/', '/lk', '/legal/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}