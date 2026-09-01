'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ProjectCard } from '@/components/ui/ProjectCard'
import type { Project } from '@/content/projects'
import { track } from '@/lib/analytics'
import { cn, plural } from '@/lib/utils'

/**
 * Каталог с фильтрами. Проектов немного, поэтому фильтры — простые чипы
 * без выпадающих списков: всё видно сразу, состояние читается с одного
 * взгляда. Комбинация без результата — честная заглушка со сбросом
 * и ссылкой на индивидуальный расчёт, а не пустой экран.
 */

const FLOORS = [
  { id: 'all', label: 'Любая этажность' },
  { id: 'Один этаж', label: 'Один этаж' },
  { id: 'С мансардой', label: 'С мансардой' },
  { id: 'Два этажа', label: 'Два этажа' },
] as const

const AREAS = [
  { id: 'all', label: 'Любая площадь' },
  { id: 'small', label: 'До 100 м²', test: (area: number) => area < 100 },
  { id: 'mid', label: '100–140 м²', test: (area: number) => area >= 100 && area <= 140 },
  { id: 'large', label: 'От 140 м²', test: (area: number) => area > 140 },
] as const

const BEDROOMS = [
  { id: 0, label: 'Спальни: любые' },
  { id: 2, label: '2' },
  { id: 3, label: '3' },
  { id: 4, label: '4+' },
] as const

const SORTS = [
  { id: 'default', label: 'Сначала популярные' },
  { id: 'price-asc', label: 'Дешевле' },
  { id: 'price-desc', label: 'Дороже' },
  { id: 'area-asc', label: 'Меньше площадь' },
] as const

type FloorsId = (typeof FLOORS)[number]['id']
type AreaId = (typeof AREAS)[number]['id']
type BedroomsId = (typeof BEDROOMS)[number]['id']
type SortId = (typeof SORTS)[number]['id']

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'chip min-h-10 cursor-pointer px-4 transition-colors duration-200 ease-out',
        active ? 'bg-dark text-white' : 'bg-surface hover:bg-panel',
      )}
    >
      {children}
    </button>
  )
}

export function ProjectCatalog({ projects }: { projects: Project[] }) {
  const [floors, setFloors] = useState<FloorsId>('all')
  const [area, setArea] = useState<AreaId>('all')
  const [bedrooms, setBedrooms] = useState<BedroomsId>(0)
  const [sort, setSort] = useState<SortId>('default')

  const filtered = useMemo(() => {
    const areaRule = AREAS.find((item) => item.id === area)

    const list = projects.filter((project) => {
      if (floors !== 'all' && project.floorsLabel !== floors) return false
      if (areaRule && 'test' in areaRule && !areaRule.test(project.area)) return false
      if (bedrooms === 4 && project.bedrooms < 4) return false
      if ((bedrooms === 2 || bedrooms === 3) && project.bedrooms !== bedrooms) return false
      return true
    })

    if (sort === 'price-asc') return [...list].sort((a, b) => a.priceFrom - b.priceFrom)
    if (sort === 'price-desc') return [...list].sort((a, b) => b.priceFrom - a.priceFrom)
    if (sort === 'area-asc') return [...list].sort((a, b) => a.area - b.area)
    return list
  }, [floors, area, bedrooms, sort, projects])

  const isFiltered = floors !== 'all' || area !== 'all' || bedrooms !== 0

  function reset() {
    setFloors('all')
    setArea('all')
    setBedrooms(0)
  }

  function pick<T>(setter: (value: T) => void, group: string, value: T) {
    setter(value)
    track('catalog_filter', { group })
  }

  return (
    <div>
      {/* Панель фильтров: группы чипов + сортировка справа */}
      <div className="card rounded-xl p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-2">
          {FLOORS.map((item) => (
            <FilterChip key={item.id} active={floors === item.id} onClick={() => pick(setFloors, 'floors', item.id)}>
              {item.label}
            </FilterChip>
          ))}
          <span aria-hidden className="mx-1 hidden h-5 w-px bg-line sm:block" />
          {AREAS.map((item) => (
            <FilterChip key={item.id} active={area === item.id} onClick={() => pick(setArea, 'area', item.id)}>
              {item.label}
            </FilterChip>
          ))}
          <span aria-hidden className="mx-1 hidden h-5 w-px bg-line sm:block" />
          {BEDROOMS.map((item) => (
            <FilterChip key={item.id} active={bedrooms === item.id} onClick={() => pick(setBedrooms, 'bedrooms', item.id)}>
              {item.label}
            </FilterChip>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p className="text-[14px] muted" aria-live="polite">
            {filtered.length > 0 ? (
              <>
                {filtered.length} {plural(filtered.length, ['проект', 'проекта', 'проектов'])}
                {isFiltered ? <> из {projects.length}</> : null}
                {' · '}по каждому есть сданный дом и смета из договора
              </>
            ) : (
              <>Под эти условия готового проекта нет</>
            )}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {isFiltered ? (
              <button type="button" onClick={reset} className="link-underline text-[14px] muted">
                Сбросить фильтры
              </button>
            ) : null}
            <label className="flex w-full flex-col items-stretch gap-2 text-[14px] muted sm:w-auto sm:flex-row sm:items-center">
              Сортировка
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortId)}
                className="field-input min-h-11 w-full cursor-pointer rounded-full py-1.5 pl-4 pr-3 text-[14px] text-ink sm:w-auto"
              >
                {SORTS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {filtered.length > 0 ? (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, index) => (
            <li key={project.slug}>
              <ProjectCard project={project} priority={index < 3} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="card mt-3 rounded-xl p-8 text-center md:p-12">
          <h2 className="text-[clamp(1.25rem,1.1rem+0.6vw,1.6rem)]">
            Готового проекта под эти условия нет
          </h2>
          <p className="lead mx-auto mt-3 max-w-xl">
            Это не тупик: планировку меняем под вас и пересчитываем смету до подписания.
            Расскажите, что ищете, — предложим вариант за два дня.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            <Button onClick={reset} variant="outline">
              Сбросить фильтры
            </Button>
            <Button href="#final-form" arrow>
              Рассчитать индивидуальный
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
