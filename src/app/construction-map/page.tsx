import type { Metadata } from 'next'
import { ConstructionMap } from '@/components/construction/ConstructionMap'
import { PageHero } from '@/components/layout/PageHero'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { FeaturedHomeCard } from '@/components/home/FeaturedHomeCard'
import { FinalCta } from '@/components/home/FinalCta'
import { company } from '@/content/company'
import { getProjects } from '@/lib/amocrm-projects'
import { getConstructionObjects } from '@/lib/amocrm-construction'
import { demoConstructionObjects } from '@/lib/construction-demo'
import { linkedProjects } from '@/lib/construction-objects'

type Props = { searchParams: Promise<{ demo?: string; object?: string }> }

const title = 'Наши стройки на карте'
const description = 'Построенные дома Деревяги и стройки, которые идут прямо сейчас: фотографии, выполненные работы и стоимость.'
export const revalidate = 300

async function load(searchParams: Props['searchParams']) {
  const params = await searchParams
  // Демонстрационные объекты доступны только в next dev по ?demo=1.
  const demo = process.env.NODE_ENV === 'development' && params.demo === '1'
  const result = await getConstructionObjects()
  const id = Number(params.object)
  return { demo, result, objects: demo ? demoConstructionObjects : result.objects, object: params.object && Number.isInteger(id) ? id : undefined }
}

/** Ссылка на конкретный дом получает его название и фото в превью мессенджеров. */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const base: Metadata = { title, description, alternates: { canonical: '/construction-map' } }
  const { objects, object: id } = await load(searchParams)
  const object = objects.find(o => o.id === id)
  if (!object) return base
  const summary = [object.status === 'completed' ? 'Построенный дом' : 'Стройка идёт сейчас', object.location, object.area && `${object.area} м²`].filter(Boolean).join(' · ')
  return { ...base, title: object.name, description: `${summary}. ${object.description || description}`.slice(0, 200),
    openGraph: { type: 'website', locale: 'ru_RU', siteName: company.name, title: object.name, description: summary, url: `/construction-map?object=${object.id}`, images: object.photos[0] ? [{ url: object.photos[0] }] : undefined } }
}

export default async function ConstructionMapPage({ searchParams }: Props) {
  const [{ demo, result, objects, object }, projects] = await Promise.all([load(searchParams), getProjects()])
  return <>
    <PageHero crumbs={[{ label: 'Наши стройки' }]} title={<>Наши дома<span className="block text-ink-soft">на карте</span></>} />
    <Section compact>
      <ConstructionMap variant="page" objects={objects} projects={linkedProjects(objects, projects)} unavailable={!demo && result.state === 'error'} demo={demo} initialObject={object} />
    </Section>
    <Section>
      <div className="panel">
        <SectionHeader title={<>Выберите проект<span className="block text-ink-soft">своего дома</span></>} action={<Button href="/projects" variant="outline" arrow>Все проекты</Button>} />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0, 3).map(project => <FeaturedHomeCard key={project.slug} project={project} />)}
        </div>
      </div>
    </Section>
    <FinalCta formType="objects" title={<>Съездим<br />на объект<span>вместе.</span></>}
      lead={<>Лучший способ проверить подрядчика — <strong>посмотреть стройку своими глазами</strong>. Покажем каркас до зашивки, познакомим с прорабом и дадим контакты владельцев сданных домов.</>} />
  </>
}
