import type { Metadata } from 'next'
import { ConstructionMap } from '@/components/construction/ConstructionMap'
import { PageHero } from '@/components/layout/PageHero'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { FeaturedHomeCard } from '@/components/home/FeaturedHomeCard'
import { getProjects } from '@/lib/amocrm-projects'
import { getConstructionObjects } from '@/lib/amocrm-construction'
import type { ConstructionObject } from '@/lib/construction-objects'

export const metadata: Metadata = { title: 'Наши стройки на карте', description: 'Построенные дома и текущие стройки Деревяги: фотографии, выполненные работы и стоимость.', alternates: { canonical: '/construction-map' } }
export const revalidate = 300

export default async function ConstructionMapPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const demo = process.env.NODE_ENV === 'development' && (await searchParams).demo === '1'
  const [result, projects] = await Promise.all([getConstructionObjects(), getProjects()])
  const examples: ConstructionObject[] = demo ? [
    { id: -1, name: 'Пример: дом в Рощино', location: 'Рощино', lat: 60.25, lng: 29.61, status: 'completed', area: 86, price: 3780000, description: 'Пример карточки готового дома. Здесь будет описание вашего реального объекта.', works: ['Устройство фундамента', 'Сборка каркаса и кровли', 'Утепление и отделка фасада'], photos: ['/photos/project-cards-v7/roshchino-86.png'] },
    { id: -2, name: 'Пример: стройка в Токсово', location: 'Токсово', lat: 60.15, lng: 30.52, status: 'building', area: 78, price: 3450000, description: 'Пример текущей стройки. Менеджер обновляет фотографии и выполненные работы в amoCRM.', works: ['Подготовка участка', 'Монтаж фундамента', 'Сборка стен первого этажа'], photos: ['/photos/project-cards-v7/toksovo-78.png'] },
    { id: -3, name: 'Пример: дом во Всеволожске', location: 'Всеволожск', lat: 60.02, lng: 30.65, status: 'completed', area: 96, works: ['Дом передан заказчику'], description: 'Демонстрационный объект, не реальная стройка.', photos: ['/photos/project-cards-v7/sosnovka-96.png'] },
  ] : []
  return <>
    <PageHero crumbs={[{ label: 'Наши стройки' }]} title={<>Наши дома<span className="block text-ink-soft">на карте</span></>} />
    <Section compact>
      <ConstructionMap objects={demo ? examples : result.objects} unavailable={result.state === 'error'} demo={demo} />
    </Section>
    <Section>
      <div className="panel">
        <SectionHeader title={<>Выберите проект<span className="block text-ink-soft">своего дома</span></>} action={<Button href="/projects" variant="outline" arrow>Все проекты</Button>} />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0, 3).map(project => <FeaturedHomeCard key={project.slug} project={project} />)}
        </div>
      </div>
    </Section>
  </>
}
