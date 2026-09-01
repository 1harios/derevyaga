import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Fragment } from 'react'
import {
  LuBath,
  LuBedDouble,
  LuCircleCheck,
  LuClock3,
  LuHouse,
  LuLayers3,
  LuMaximize2,
  LuPaintbrush,
  LuShieldCheck,
  LuThermometerSun,
  LuTrees,
  LuWarehouse,
} from 'react-icons/lu'
import { FinalCta } from '@/components/home/FinalCta'
import { HeaderInline } from '@/components/layout/HeaderInline'
import { Button } from '@/components/ui/Button'
import { ComplectationColumns } from '@/components/ui/ComparisonTable'
import { CountUp } from '@/components/ui/CountUp'
import { AssetPlaceholder } from '@/components/ui/Placeholder'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { Section, SectionHeader } from '@/components/ui/Section'
import { StagesTimeline } from '@/components/ui/Timeline'
import { promises } from '@/content/company'
import { projectTagLabels } from '@/content/projects'
import { getProjects } from '@/lib/amocrm-projects'
import { totalDays } from '@/content/stages'
import { formatPrice, pluralized } from '@/lib/utils'
import { siteUrl } from '@/lib/site-url'

export const revalidate = 300

const constructionMaterials = [
  { icon: LuLayers3, label: 'Фундамент', value: 'Свайно-винтовой с обвязкой' },
  { icon: LuHouse, label: 'Каркас', value: 'Брус камерной сушки 45×195 мм' },
  { icon: LuThermometerSun, label: 'Утепление', value: 'Стены 200 мм · кровля 250 мм · пол 200 мм' },
  { icon: LuShieldCheck, label: 'Защита стен', value: 'Ветрозащита, пароизоляция и вентзазор' },
  { icon: LuWarehouse, label: 'Кровля', value: 'Металлочерепица с водостоком' },
  { icon: LuPaintbrush, label: 'Фасад', value: 'Имитация бруса, покраска в два слоя' },
]

export async function generateStaticParams() {
  const projects = await getProjects()
  return projects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const projects = await getProjects()
  const project = projects.find((item) => item.slug === slug)
  if (!project) return {}

  return {
    title: `${project.name} — каркасный дом ${project.area} м² за ${formatPrice(project.priceFrom)}`,
    description: `${project.summary} Срок строительства ${project.days} дней, цена фиксируется в договоре.`,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { images: [{ url: project.photo }] },
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const projects = await getProjects()
  const project = projects.find((item) => item.slug === slug)
  if (!project) notFound()

  const heroStats = [
    { icon: LuMaximize2, value: project.area, suffix: ' м²', label: 'площадь дома' },
    { icon: LuBedDouble, value: project.bedrooms, suffix: '', label: 'спальни в проекте' },
    { icon: LuClock3, value: project.days, suffix: '', label: 'дней срок под ключ' },
  ]
  const galleryImages = project.gallery?.length
    ? [{ src: project.photo, alt: project.photoAlt }, ...project.gallery]
    : []

  /** Похожие — ближайшие по площади, кроме текущего */
  const similar = [...projects]
    .filter((item) => item.slug !== project.slug)
    .sort((a, b) => Math.abs(a.area - project.area) - Math.abs(b.area - project.area))
    .slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Каркасный дом «${project.name}» ${project.area} м²`,
    description: project.summary,
    image: `${siteUrl}${project.photo}`,
    offers: {
      '@type': 'Offer',
      price: project.priceFrom,
      priceCurrency: 'RUB',
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}/projects/${project.slug}`,
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Первый экран проекта повторяет композицию главной: типографический
          блок слева, фотография во всю высоту справа, цифры — якорь низа. */}
      <section className="pt-1">
        <div className="shell">
          <div className="grid gap-3 lg:h-[calc(100svh-16px)] lg:min-h-[700px] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-4">
            <div className="panel panel--sheen flex flex-col pt-6">
              <HeaderInline />

              <div className="mt-8 lg:mt-[clamp(2rem,5svh,3.5rem)]">
                <h1 className="text-pretty lg:text-[clamp(40px,2vw+20px,54px)] lg:leading-[1.06]" data-reveal>
                  {project.name}
                  <br />
                  {project.area} м² · {project.floorsLabel.toLowerCase()}
                </h1>

                <div
                  className="mt-4 flex items-center gap-4"
                  data-reveal
                  style={{ '--reveal-delay': '100ms' } as React.CSSProperties}
                >
                  <span className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 font-sans text-[12.5px] font-medium text-ink sm:shrink-0 sm:text-[13px]">
                    <span className="inline-flex items-center gap-1.5">
                      <LuBedDouble aria-hidden className="size-4 text-brand" />
                      {pluralized(project.bedrooms, ['спальня', 'спальни', 'спален'])}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <LuBath aria-hidden className="size-4 text-brand" />
                      {pluralized(project.bathrooms, ['санузел', 'санузла', 'санузлов'])}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <LuTrees aria-hidden className="size-4 text-brand" />
                      терраса {project.terrace} м²
                    </span>
                  </span>
                  <span aria-hidden className="hidden h-px min-w-8 flex-1 bg-black/10 sm:block" />
                </div>
              </div>

              <div className="my-auto py-8 lg:py-6">
                <p
                  className="max-w-[520px] font-sans text-[15px] leading-[1.6] text-ink-soft"
                  data-reveal
                  style={{ '--reveal-delay': '180ms' } as React.CSSProperties}
                >
                  {project.summary}
                </p>

                <div
                  className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-3"
                  data-reveal
                  style={{ '--reveal-delay': '220ms' } as React.CSSProperties}
                >
                  <div>
                    <div className="text-[12px] text-ink-soft">Цена в базовой комплектации</div>
                    <div className="num mt-1 text-[clamp(1.75rem,1.35rem+1.3vw,2.4rem)]">
                      от {formatPrice(project.priceFrom)}
                    </div>
                  </div>
                  <p className="max-w-[245px] pb-1 text-[12.5px] leading-[1.5] text-ink-soft">
                    Цена и состав работ фиксируются в договоре до начала строительства.
                  </p>
                </div>

                <div
                  className="mt-4 flex flex-wrap gap-2"
                  data-reveal
                  style={{ '--reveal-delay': '245ms' } as React.CSSProperties}
                >
                  <Link href="/mortgage" className="chip chip--brand">Семейная ипотека</Link>
                  <Link href="/mortgage" className="chip chip--brand">Материнский капитал</Link>
                  <span className="chip">Цена актуальна</span>
                </div>

                <div
                  className="mt-6 flex flex-wrap gap-2.5"
                  data-reveal
                  style={{ '--reveal-delay': '270ms' } as React.CSSProperties}
                >
                  <Button href="#final-form" arrow>
                    Получить смету проекта
                  </Button>
                  <Button href="/calculator" variant="outline">
                    Пересчитать под себя
                  </Button>
                </div>
              </div>

              <div
                className="mt-auto flex w-full items-start justify-between gap-3 border-t border-black/[0.07] pt-6"
                data-reveal
                style={{ '--reveal-delay': '300ms' } as React.CSSProperties}
              >
                {heroStats.map((stat, index) => (
                  <Fragment key={stat.label}>
                    {index > 0 ? <span aria-hidden className="h-12 w-px shrink-0 bg-black/10" /> : null}
                    <div className="min-w-0 flex-1">
                      <stat.icon aria-hidden className="mb-2 size-4 text-brand" />
                      <div className="num text-[clamp(1.6rem,1.2rem+1.35vw,2.4rem)] leading-none">
                        <CountUp value={stat.value} duration={1400 + index * 250} />
                        <span className="text-ink-faint">{stat.suffix}</span>
                      </div>
                      <p className="mt-2 text-[11.5px] leading-[1.35] text-ink-soft sm:text-[12.5px]">
                        {stat.label}
                      </p>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>

            <div className="relative min-h-[380px] max-lg:aspect-[4/5] lg:h-full">
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <Image
                  src={project.photo}
                  alt={project.photoAlt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              {project.tag ? (
                <span className="chip chip--glass absolute left-5 top-6">
                  {projectTagLabels[project.tag]}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {project.description?.length || galleryImages.length ? (
        <Section>
          <div className="panel">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-12">
              <div>
                <p className="eyebrow mb-3">О проекте</p>
                <h2 className="text-pretty">Дом, в котором удобно каждый день</h2>
                <div className="mt-5 space-y-4 text-[14.5px] leading-[1.65] text-ink-soft">
                  {(project.description ?? [project.summary]).map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {galleryImages.length ? (
                <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                  {galleryImages.map((image, index) => (
                    <div
                      key={image.src}
                      className={`relative min-h-[300px] overflow-hidden rounded-xl ${
                        index === 0 ? 'sm:translate-y-6' : ''
                      }`}
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(min-width: 1024px) 32vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </Section>
      ) : null}

      <Section>
        <div className="panel">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-12">
            <div>
              <p className="eyebrow mb-3">В базовой цене</p>
              <h2 className="text-pretty">Что входит и из чего строим</h2>
              <p className="mt-4 max-w-sm text-[14px] leading-[1.55] text-ink-soft">
                Основные материалы уже учтены в стоимости проекта. Точный объём и марки закрепляем в смете до договора.
              </p>
            </div>

            <ul className="grid gap-x-6 sm:grid-cols-2">
              {constructionMaterials.map((item) => (
                <li key={item.label} className="border-t border-line py-4">
                  <span className="inline-flex items-center gap-2 text-[12px] text-ink-soft">
                    <item.icon aria-hidden className="size-4 text-brand" />
                    {item.label}
                  </span>
                  <p className="mt-1 text-[15px] leading-[1.45] text-ink">{item.value}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Планировка: решения + место под чертежи, которых пока нет */}
      <Section>
        <div className="panel">
          <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-12">
            <div className="min-w-0">
              <p className="eyebrow mb-3">Планировка</p>
              <h2>Что внутри и почему так</h2>
              <p className="lead mt-4">
                Планировка — не догма: двигаем перегородки, меняем окна и состав комнат
                под вашу семью. Пересчёт сметы после правок — до подписания, бесплатно.
              </p>

              <ul className="mt-7 space-y-4 border-t border-line pt-7 text-[15px] leading-[1.55]">
                {project.highlights.map((item) => (
                  <li key={item} className="flex gap-3">
                    <LuCircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-brand" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ЗАМЕНИТЬ: поэтажные планы от проектировщика */}
            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              <AssetPlaceholder
                what={`План первого этажа «${project.name}» с размерами комнат`}
                size="1200×900, схема на белом фоне"
                ratio="4 / 3"
              />
              {project.floorsLabel === 'Один этаж' ? (
                <AssetPlaceholder
                  what={`Схема расстановки мебели «${project.name}»`}
                  size="1200×900, схема на белом фоне"
                  ratio="4 / 3"
                />
              ) : (
                <AssetPlaceholder
                  what={`План ${project.floorsLabel === 'С мансардой' ? 'мансардного' : 'второго'} этажа «${project.name}»`}
                  size="1200×900, схема на белом фоне"
                  ratio="4 / 3"
                />
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* Комплектации: чем отличаются варианты исполнения этого проекта */}
      <Section>
        <SectionHeader
          align="center"
          eyebrow="Комплектации"
          title={`Что входит в цену «${project.name}»`}
          description="Конструктив одинаковый во всех вариантах. Выберите уровень готовности: каркас, под чистовую или под ключ."
        />
        <ComplectationColumns />
      </Section>

      {/* Сроки: этапы под этот проект */}
      <Section>
        <SectionHeader
          eyebrow="Сроки"
          title={`${project.name} строится ${pluralized(project.days, ['день', 'дня', 'дней'])}`}
          description={
            <>
              {project.days === totalDays ? (
                <>Срок совпадает с типовым графиком — {totalDays} дня на восемь этапов.</>
              ) : (
                <>
                  Типовой график — {totalDays} дня, у этого проекта срок{' '}
                  <strong>{project.days > totalDays ? 'длиннее' : 'короче'} из-за площади</strong>.
                </>
              )}{' '}
              Точный график по этапам с датами будет в договоре, задержка по нашей вине —
              пеня 0,1% за день.
            </>
          }
          action={
            <Button href="/guarantee" variant="outline" size="sm" arrow>
              Про договор и гарантию
            </Button>
          }
        />
        <StagesTimeline />
      </Section>

      {/* Похожие проекты — по площади */}
      <Section>
        <SectionHeader
          eyebrow="Похожие проекты"
          title="Посмотрите рядом по площади"
          action={
            <Button href="/projects" variant="outline" size="sm" arrow>
              Весь каталог
            </Button>
          }
        />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {similar.map((item) => (
            <li key={item.slug}>
              <ProjectCard project={item} />
            </li>
          ))}
        </ul>
      </Section>

      <FinalCta
        formType="project-page"
        projectSlug={project.slug}
        area={project.area}
        title={`Смета «${project.name}» за ${promises.estimateDays} дня`}
        lead={
          <>
            Пришлём полную смету проекта в PDF: состав работ по этапам, график платежей
            и что в цену не входит. <strong>Под ваш участок пересчитаем бесплатно</strong> —
            замер тоже бесплатный.
          </>
        }
      />
    </>
  )
}
