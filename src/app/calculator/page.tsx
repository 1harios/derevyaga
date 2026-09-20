import type { Metadata } from 'next'
import { HouseConstructor } from '@/components/constructor/HouseConstructor'
import { PageHero } from '@/components/layout/PageHero'
import { ProjectCatalog } from '@/components/projects/ProjectCatalog'
import { getProjects } from '@/lib/amocrm-projects'
import './constructor.css'
import './compact-constructor.css'

export const revalidate = 300
export const metadata: Metadata = {
  title: 'Конструктор дома: соберите и посчитайте каркасный дом',
  description: 'Выберите размер, кровлю, отделку и террасу. Посмотрите варианты отделки дома, предварительную стоимость и ежемесячный платёж по ипотеке.',
  alternates: { canonical: '/calculator' },
}

export default async function CalculatorPage() {
  const projects = await getProjects()
  return <div className="calculator-page">
    <div className="constructor-page-heading"><PageHero crumbs={[{ label: 'Калькулятор' }]} title="Конструктор дома" lead={<><strong>Размеры</strong>, материалы и <strong>стоимость</strong> — в одном месте.</>} /></div>
    <HouseConstructor />
    <section className="constructor-catalog shell">
      <div className="constructor-section-heading"><h2>Или выберите готовый проект</h2></div>
      <ProjectCatalog projects={projects} />
    </section>
  </div>
}

