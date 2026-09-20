import type { MetadataRoute } from 'next'
import { cities } from '@/content/cities'
import { getProjects } from '@/lib/amocrm-projects'
import { siteUrl } from '@/lib/site-url'

export const revalidate = 300

/**
 * Карта сайта собирается из тех же данных, что и страницы: новый проект,
 * или город попадают сюда без правок этого файла.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects()
  const staticPages: { path: string; priority: number }[] = [
    { path: '/', priority: 1 },
    { path: '/projects', priority: 0.9 },
    { path: '/calculator', priority: 0.9 },
    { path: '/promotions', priority: 0.7 },
    { path: '/reviews', priority: 0.6 },
    { path: '/guarantee', priority: 0.6 },
    { path: '/mortgage', priority: 0.6 },
    { path: '/faq', priority: 0.5 },
    { path: '/contacts', priority: 0.5 },
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
  ]
}
