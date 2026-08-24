import type { MetadataRoute } from 'next'
import { blogPosts } from '@/content/blog'
import { cities } from '@/content/cities'
import { projects } from '@/content/projects'
import { siteUrl } from '@/lib/site-url'

/** Для статического превью (output: export) маршрут должен быть явно статическим */
export const dynamic = 'force-static'

/**
 * Карта сайта собирается из тех же данных, что и страницы: новый проект,
 * статья или город попадают сюда без правок этого файла.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: { path: string; priority: number }[] = [
    { path: '/', priority: 1 },
    { path: '/projects', priority: 0.9 },
    { path: '/calculator', priority: 0.9 },
    { path: '/prices', priority: 0.8 },
    { path: '/complectations', priority: 0.8 },
    { path: '/technology', priority: 0.7 },
    { path: '/objects', priority: 0.7 },
    { path: '/reviews', priority: 0.6 },
    { path: '/about', priority: 0.6 },
    { path: '/guarantee', priority: 0.6 },
    { path: '/mortgage', priority: 0.6 },
    { path: '/faq', priority: 0.5 },
    { path: '/blog', priority: 0.5 },
    { path: '/contacts', priority: 0.5 },
    { path: '/vacancies', priority: 0.3 },
  ]

  return [
    ...staticPages.map((page) => ({
      url: `${siteUrl}${page.path === '/' ? '' : page.path}`,
      priority: page.priority,
      changeFrequency: 'weekly' as const,
    })),
    ...projects.map((project) => ({
      url: `${siteUrl}/projects/${project.slug}`,
      priority: 0.8,
      changeFrequency: 'weekly' as const,
    })),
    ...cities.map((city) => ({
      url: `${siteUrl}/karkasnye-doma/${city.slug}`,
      priority: 0.6,
      changeFrequency: 'monthly' as const,
    })),
    ...blogPosts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      priority: 0.4,
      changeFrequency: 'monthly' as const,
      lastModified: post.date,
    })),
  ]
}