import type { Metadata } from 'next'
import { PromotionsBlock } from '@/components/home/PromotionsBlock'
import { notFound } from 'next/navigation'
import { LuBath, LuBedDouble, LuClock3, LuHouse, LuMaximize2, LuTrees, LuCheck } from 'react-icons/lu'
import { FinalCta } from '@/components/home/FinalCta'
import { HeaderInline } from '@/components/layout/HeaderInline'
import { Button } from '@/components/ui/Button'
import { FeaturedHomeCard } from '@/components/home/FeaturedHomeCard'
import cardStyles from '@/components/home/FeaturedHomeCard.module.css'
import { Section, SectionHeader } from '@/components/ui/Section'
import { ProjectGallery } from '@/components/projects/ProjectGallery'
import { ProjectComplectation } from '@/components/projects/ProjectComplectation'
import { getProjects } from '@/lib/amocrm-projects'
import { formatPrice, pluralized } from '@/lib/utils'
import { siteUrl } from '@/lib/site-url'

export const revalidate = 300
export async function generateStaticParams() { return (await getProjects()).map(({ slug }) => ({ slug })) }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const project = (await getProjects()).find((item) => item.slug === slug)
  if (!project) return {}
  return { title: `${project.name} — каркасный дом ${project.area} м² от ${formatPrice(project.priceFrom)}`, description: project.summary, alternates: { canonical: `/projects/${slug}` }, openGraph: { images: [{ url: project.photo }] } }
}
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const projects = await getProjects()
  const project = projects.find((item) => item.slug === slug)
  if (!project) notFound()
  const stats = [
    { icon: LuMaximize2, label: 'Площадь', value: `${project.area} м²` },
    { icon: LuHouse, label: 'Этажность', value: project.floorsLabel },
    { icon: LuBedDouble, label: 'Спальни', value: project.bedrooms },
    { icon: LuBath, label: 'Санузлы', value: project.bathrooms },
    { icon: LuTrees, label: 'Терраса', value: `${project.terrace} м²` },
    { icon: LuClock3, label: 'Срок строительства', value: pluralized(project.days, ['день', 'дня', 'дней']) },
  ]
  const similar = projects.filter((item) => item.slug !== slug).sort((a, b) => Math.abs(a.area - project.area) - Math.abs(b.area - project.area)).slice(0, 6)
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Product', name: `Каркасный дом «${project.name}» ${project.area} м²`, description: project.summary, image: new URL(project.photo, siteUrl).href, offers: { '@type': 'Offer', price: project.priceFrom, priceCurrency: 'RUB', availability: 'https://schema.org/InStock', url: `${siteUrl}/projects/${slug}` } }
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    <section className="pt-1"><div className="shell"><div className="grid gap-3 lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)]">
      <div className="panel panel--sheen flex flex-col"><HeaderInline /><div className="my-8 lg:my-12"><p className="mb-3 text-xs uppercase tracking-widest text-ink-soft">Проект вашего дома</p><h1>{project.name}</h1><p className="mt-5 max-w-lg text-sm leading-relaxed text-ink-soft">{project.summary}</p></div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-3">{stats.map((stat) => <div key={stat.label} className="border-t border-line pt-3"><stat.icon aria-hidden className="mb-2 size-4 text-brand" /><p className="text-xs text-ink-soft">{stat.label}</p><p className="mt-1 text-base font-medium">{stat.value}</p></div>)}</div>
        <div className="mt-auto pt-8"><p className="text-xs text-ink-soft">Стоимость проекта — от</p><p className="num mt-1 text-[clamp(26px,3vw,40px)]">{formatPrice(project.priceFrom)}</p><p className="mt-2 text-xs text-ink-soft">Окончательная цена зависит от согласованной комплектации.</p><div className="project-hero-actions mt-5 flex flex-wrap gap-2"><Button href="#final-form" arrow>Получить смету</Button><Button href="#complectation" variant="outline" arrow>Состав комплектации</Button></div></div>
      </div>
      <ProjectGallery name={project.name} images={[{ src: project.photo, alt: project.photoAlt }, ...(project.gallery ?? [])]} />
    </div></div></section>
    <Section><div className="grid items-stretch gap-3 lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)]"><div className="lg:pr-10"><h2>Описание проекта</h2><div className="mt-5 space-y-4 text-sm leading-relaxed text-ink-soft">{(project.description ?? [project.summary]).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><ul className="mt-7 grid gap-x-6 gap-y-5 sm:grid-cols-2">{project.highlights.map((item) => <li key={item} className="flex items-start gap-3 text-sm leading-relaxed"><LuCheck aria-hidden className="mt-1 size-5 shrink-0 text-brand" /><span>{item}</span></li>)}</ul></div><div className="overflow-hidden rounded-2xl border border-line bg-panel">{project.floorPlans?.length ? <ProjectGallery name={project.name} images={project.floorPlans} plan /> : project.slug === 'roshchino-86' ? <><ProjectGallery name={project.name} images={[{src: '/photos/roshchino-plan-demo.webp', alt: 'Пример планировки — временный концептуальный эскиз, не рабочий чертёж'}]} plan /></> : <div className="flex min-h-[320px] flex-col items-center justify-center p-8 text-center"><LuHouse aria-hidden className="mb-5 size-12 text-brand" /><h3 className="text-2xl">Планировка «{project.name}»</h3><p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">Запросите план с расположением комнат и размерами у нашего специалиста.</p><Button href="#final-form" variant="outline" arrow className="mt-6">Запросить планировку</Button></div>}</div></div></Section>
    <Section id="complectation" className="scroll-mt-24 !pt-0"><ProjectComplectation singleFloor={project.floorsLabel === 'Один этаж'} /></Section>
    <div id="purchase" className="scroll-mt-24"><PromotionsBlock /></div>
    <Section id="similar-projects"><SectionHeader title={<>Вам также<span className="block text-ink-soft">могут подойти</span></>} action={<Button href="/projects" variant="outline" arrow>Каталог проектов</Button>} /><ul className={cardStyles.grid}>{similar.map((item) => <li key={item.slug}><FeaturedHomeCard project={item} /></li>)}</ul></Section>
    <FinalCta formType="project-page" projectSlug={project.slug} area={project.area} title={<>Смета вашего дома<span className="block text-ink-soft">«{project.name}»</span></>} lead={<>Подготовим <strong>состав работ и подробный расчёт</strong> с учётом участка и выбранной комплектации.</>} />
  </>
}

