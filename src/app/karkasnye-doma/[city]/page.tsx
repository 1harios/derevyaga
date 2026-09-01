import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FinalCta } from '@/components/home/FinalCta'
import { PageHero } from '@/components/layout/PageHero'
import { Button } from '@/components/ui/Button'
import { ObjectCard } from '@/components/ui/ObjectCard'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { Section, SectionHeader } from '@/components/ui/Section'
import { cities } from '@/content/cities'
import { company, promises } from '@/content/company'
import { builtObjects } from '@/content/objects'
import { getProjects } from '@/lib/amocrm-projects'
import { pricing } from '@/lib/pricing/pricing.config'
import { formatNumber, formatPrice } from '@/lib/utils'

export const revalidate = 300

export function generateStaticParams() {
  return cities.map((city) => ({ city: city.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>
}): Promise<Metadata> {
  const { city: slug } = await params
  const city = cities.find((item) => item.slug === slug)
  if (!city) return {}
  const projects = await getProjects()

  return {
    title: `Каркасные дома под ключ ${city.inCity} — цены и сроки`,
    description: `Строим каркасные дома ${city.inCity} и окрестностях: фиксированная смета, срок от ${Math.min(...projects.map((p) => p.days))} дней, гарантия ${promises.guaranteeYears} лет. ${city.distanceKm <= pricing.distance.freeKm ? 'Доставка включена в цену.' : 'Логистика считается прозрачно, за километры.'}`,
    alternates: { canonical: `/karkasnye-doma/${city.slug}` },
  }
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params
  const city = cities.find((item) => item.slug === slug)
  if (!city) notFound()
  const projects = await getProjects()

  const extraKm = Math.max(0, city.distanceKm - pricing.distance.freeKm)
  const logisticsCost = extraKm * pricing.distance.pricePerKm

  const cityObjects = city.objectsMatch
    ? builtObjects.filter((object) => object.location.includes(city.objectsMatch!))
    : []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Строительство каркасных домов ${city.inCity}`,
    provider: { '@type': 'LocalBusiness', name: company.name, telephone: company.phone },
    areaServed: { '@type': 'City', name: city.name },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHero
        crumbs={[{ href: '/projects', label: 'Проекты' }, { label: city.name }]}
        title={`Каркасные дома под ключ ${city.inCity}`}
        lead={
          <>
            Строим {city.inCity} и окрестностях по той же схеме, что и везде:{' '}
            <strong>смета фиксируется в договоре</strong>, стройка видна в личном кабинете,
            гарантия {promises.guaranteeYears} лет на конструктив.
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <span className="chip bg-surface">~{city.distanceKm} км от КАД</span>
          {extraKm === 0 ? (
            <span className="chip bg-surface">доставка включена в цену</span>
          ) : (
            <span className="chip bg-surface">логистика {formatPrice(logisticsCost)} — уже в смете</span>
          )}
          <span className="chip bg-surface">срок от {Math.min(...projects.map((p) => p.days))} дней</span>
        </div>
      </PageHero>

      {/* Особенности направления: грунты, подъезд, локальная специфика */}
      <Section compact>
        <div className="panel">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-12">
            <div>
              <p className="eyebrow mb-3">Что важно знать про направление</p>
              <h2 className="text-[clamp(1.3rem,1.1rem+0.8vw,1.75rem)]">
                Как строится {city.name} и окрестности
              </h2>
              <p className="mt-4 max-w-2xl text-[15.5px] leading-[1.7] muted">{city.note}</p>
            </div>

            <div className="card rounded-xl p-6">
              <p className="caption">Логистика до участка</p>
              {extraKm === 0 ? (
                <>
                  <div className="num mt-3 text-[26px]">0 ₽</div>
                  <p className="mt-2 text-[14px] leading-[1.6] muted">
                    Первые {pricing.distance.freeKm} км от КАД включены в цену —{' '}
                    {city.name} попадает в эту зону целиком.
                  </p>
                </>
              ) : (
                <>
                  <div className="num mt-3 text-[26px]">≈ {formatPrice(logisticsCost)}</div>
                  <p className="mt-2 text-[14px] leading-[1.6] muted">
                    Первые {pricing.distance.freeKm} км включены, дальше —{' '}
                    {formatNumber(pricing.distance.pricePerKm)} ₽ за км. Для {city.name} это
                    примерно {extraKm} км сверх зоны. Цифра войдёт в фиксированную смету —
                    доплат по дороге не будет.
                  </p>
                </>
              )}
              <div className="mt-5">
                <Button href="/calculator" variant="outline" size="sm" wide arrow>
                  Посчитать с логистикой
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Сданный объект в этом направлении — если есть */}
      {cityObjects.length > 0 ? (
        <Section>
          <SectionHeader
            eyebrow="Построено рядом"
            title="Сданные дома в этом направлении"
            description="План-факт сроков и слова владельцев — как есть, включая задержки."
            action={
              <Button href="/objects" variant="outline" size="sm" arrow>
                Все объекты
              </Button>
            }
          />
          <ul className="grid gap-3 lg:grid-cols-2">
            {cityObjects.map((object) => (
              <li key={object.slug}>
                <ObjectCard object={object} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* Каталог проектов */}
      <Section>
        <SectionHeader
          eyebrow="Проекты"
          title={`Что можно построить ${city.inCity}`}
          description="Любой проект из каталога адаптируем под участок: планировку меняем бесплатно, смету пересчитываем до подписания."
          action={
            <Button href="/projects" variant="outline" size="sm" arrow>
              Весь каталог
            </Button>
          }
        />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0, 6).map((project) => (
            <li key={project.slug}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      </Section>

      {/* Перелинковка на соседние направления */}
      <Section compact>
        <div className="rounded-xl bg-panel p-6 md:p-7">
          <p className="caption mb-4">Строим и в других направлениях</p>
          <ul className="flex flex-wrap gap-2">
            {cities
              .filter((item) => item.slug !== city.slug)
              .map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/karkasnye-doma/${item.slug}`}
                    className="chip bg-surface transition-colors duration-200 ease-out hover:bg-dark hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </Section>

      <FinalCta
        formType={`city-${city.slug}`}
        title={`Замер участка ${city.inCity} — бесплатно`}
        lead={
          <>
            Замерщик приедет, посмотрит подъезд и грунты, ответит на вопросы.
            Смета за {promises.estimateDays} рабочих дня — <strong>с логистикой
            и без строк «уточним по месту»</strong>.
          </>
        }
      />
    </>
  )
}
