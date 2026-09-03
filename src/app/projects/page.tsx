import type { Metadata } from 'next'
import { FinalCta } from '@/components/home/FinalCta'
import { PageHero } from '@/components/layout/PageHero'
import { ProjectCatalog } from '@/components/projects/ProjectCatalog'
import { Section } from '@/components/ui/Section'
import { promises } from '@/content/company'
import { getProjects } from '@/lib/amocrm-projects'
import { siteUrl } from '@/lib/site-url'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const projects = await getProjects()
  return {
    title: 'Проекты каркасных домов с ценами и сроками',
    description: `Каталог каркасных домов под ключ от ${Math.min(...projects.map((p) => p.area))} до ${Math.max(...projects.map((p) => p.area))} м². По каждому проекту — сданный дом, цена и срок из договора. Планировку меняем под вас.`,
    alternates: { canonical: '/projects' },
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Проекты каркасных домов «Деревяга»',
    itemListElement: projects.map((project, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${siteUrl}/projects/${project.slug}`,
      name: `${project.name} ${project.area} м²`,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHero
        crumbs={[{ label: 'Проекты' }]}
        title="Проекты, по которым уже построены дома"
        lead={
          <>
            Здесь нет «бумажных» проектов из интернета: по каждому есть{' '}
            <strong>сданный дом, реальная смета и срок из договора</strong>. Планировку меняем
            под ваш участок и пересчитываем цену до подписания — бесплатно.
          </>
        }
      />

      <Section>
        <ProjectCatalog projects={projects} />

        <p className="mx-auto mt-6 max-w-2xl text-center text-[14px] leading-[1.6] muted">
          Цена «от» — базовая комплектация проекта при типовом свайно-винтовом фундаменте
          и удалении до 50 км от КАД. Точную смету считаем после бесплатного выезда
          замерщика и фиксируем в договоре — она не меняется из-за подорожания материалов.
        </p>
      </Section>

      <FinalCta
        formType="projects-catalog"
        title="Не нашли свой дом в каталоге?"
        lead={
          <>
            Расскажите про участок и то, как планируете жить, — предложим планировку
            и посчитаем смету за {promises.estimateDays} рабочих дня.{' '}
            <strong>Индивидуальный проект не дороже типового</strong>, если площадь та же.
          </>
        }
      />
    </>
  )
}
