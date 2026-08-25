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
        // Служебные маршруты API не должны обходиться поисковыми роботами.
        // Кабинет и юридические страницы доступны для обхода, чтобы робот
        // увидел их meta noindex и корректно исключил из выдачи.
        disallow: ['/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
