'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LuCalendarCheck, LuExpand, LuMapPin, LuMaximize2, LuMinus, LuPlus, LuScan, LuShrink } from 'react-icons/lu'
import { ArrowIcon, Button } from '@/components/ui/Button'
import { cities } from '@/content/cities'
import { track } from '@/lib/analytics'
import type { ConstructionObject, MapProject } from '@/lib/construction-objects'
import { cn, formatPrice, plural } from '@/lib/utils'
import { ObjectDetails, ObjectPhoto, StatusChip, statusText } from './ObjectDetails'
import { useConstructionMap, type Insets, type MapPoint } from './useConstructionMap'
import styles from './ConstructionMap.module.css'

type Filter = 'all' | ConstructionObject['status']
const filters: { value: Filter; label: string }[] = [{ value: 'all', label: 'Все' }, { value: 'completed', label: 'Построены' }, { value: 'building', label: 'Строятся' }]
// Пока в CRM нет объектов, карта показывает направления, где строим, со ссылками на страницы городов.
const cityPoints: MapPoint[] = cities.map((city, i) => {
  const [lat, lng] = city.coordinates
  // Подпись уходит влево, если вплотную справа стоит другой город (Сертолово рядом с Токсово).
  const crowded = cities.some(other => other.coordinates[1] > lng && other.coordinates[1] - lng < 0.6 && Math.abs(other.coordinates[0] - lat) < 0.1)
  return { id: 100_000 + i, lat, lng, kind: 'city', label: city.name, side: crowded ? 'left' : 'right' }
})
const pointOf = (o: ConstructionObject): MapPoint => ({ id: o.id, lat: o.lat, lng: o.lng, kind: o.status })
const noSubscription = () => () => {}

function useMedia(query: string) {
  return useSyncExternalStore(
    useCallback((change: () => void) => { const list = window.matchMedia(query); list.addEventListener('change', change); return () => list.removeEventListener('change', change) }, [query]),
    () => window.matchMedia(query).matches,
    () => false,
  )
}

function Filters({ value, counts, onChange }: { value: Filter; counts: Record<Filter, number>; onChange: (filter: Filter) => void }) {
  return <div className={styles.segmented} role="group" aria-label="Статус дома" style={{ '--index': filters.findIndex(f => f.value === value) } as CSSProperties}>
    {filters.map(f => <button key={f.value} type="button" aria-pressed={value === f.value} disabled={!counts[f.value]} onClick={() => onChange(f.value)}>
      {f.label}<span className={styles.count}>{counts[f.value]}</span>
    </button>)}
  </div>
}

function ObjectCard({ object, highlighted, onOpen, onHover }: { object: ConstructionObject; highlighted: boolean; onOpen: () => void; onHover: (id: number | null) => void }) {
  return <button type="button" className={styles.card} data-id={object.id} data-highlighted={highlighted || undefined} onClick={onOpen}
    onMouseEnter={() => onHover(object.id)} onMouseLeave={() => onHover(null)} onFocus={() => onHover(object.id)} onBlur={() => onHover(null)}>
    <span className={styles.thumb}>
      <ObjectPhoto key={object.photos[0] ?? object.id} src={object.photos[0]} kind={object.status} />
      <StatusChip status={object.status} onPhoto />
    </span>
    <span className={styles.cardBody}>
      <strong className={styles.cardName}>{object.name}</strong>
      <span className={styles.cardMeta}>
        <span><LuMapPin aria-hidden />{object.location || 'Ленинградская область'}</span>
        {object.area && <span><LuMaximize2 aria-hidden />{object.area} м²</span>}
        {object.year && <span><LuCalendarCheck aria-hidden />Сдан в {object.year}</span>}
      </span>
      <span className={styles.cardFooter}>
        {object.price ? <span className={styles.cardPrice}>{formatPrice(object.price)}</span> : <span className={styles.cardMore}>Подробнее</span>}
        <span className={styles.cardArrow} aria-hidden><ArrowIcon /></span>
      </span>
    </span>
  </button>
}

function EmptyState({ unavailable }: { unavailable: boolean }) {
  return <div className={styles.empty}>
    <span className={styles.emptyIcon}><LuMapPin aria-hidden /></span>
    <p className={styles.emptyTitle}>{unavailable ? 'Объекты временно недоступны' : 'Скоро здесь появятся наши дома'}</p>
    <p className={styles.emptyText}>{unavailable ? 'Не получилось загрузить объекты. Обновите страницу чуть позже, а пока посмотрите, где мы строим чаще всего.' : 'Готовим фотографии и истории домов. А пока — направления, где мы строим чаще всего.'}</p>
    <ul className={styles.cityLinks}>{cities.map(city => <li key={city.slug}><Link href={`/karkasnye-doma/${city.slug}`}>{city.name}<ArrowIcon /></Link></li>)}</ul>
    <Button href="/projects" variant="outline" size="sm" arrow>Каталог проектов</Button>
  </div>
}

export function ConstructionMap({ objects, projects = [], unavailable = false, demo = false, variant = 'section', initialObject }: {
  objects: ConstructionObject[]
  /** Проекты, на которые ссылаются объекты (linkedProjects). */
  projects?: MapProject[]
  unavailable?: boolean
  demo?: boolean
  /** page — отдельная страница: высокая карта и адрес выбранного дома в строке браузера. */
  variant?: 'page' | 'section'
  /** Дом из ссылки ?object=… — карточка открыта сразу. */
  initialObject?: number
}) {
  const router = useRouter()
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY?.trim()
  const initial = objects.some(o => o.id === initialObject) ? initialObject ?? null : null
  const workspace = useRef<HTMLDivElement>(null)
  const container = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const details = useRef<HTMLDivElement>(null)
  const tooltip = useRef<HTMLDivElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const timers = useRef<{ hint?: number; toast?: number; carousel?: number }>({})
  const opened = useRef<{ from: number | null; scroll: boolean; focus: boolean }>({ from: null, scroll: false, focus: false })
  const carousel = useRef({ touched: false, locked: false })
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<number | null>(initial)
  const [hovered, setHovered] = useState<number | null>(null)
  // Последний дом под курсором: превью гаснет плавно, не теряя содержимого.
  const [previewId, setPreviewId] = useState<number | null>(null)
  const [inView, setInView] = useState(false)
  // Текст остаётся, пока плашка гаснет, — иначе на долю секунды видна пустая плашка.
  const [hint, setHint] = useState({ text: '', visible: false })
  const [toast, setToast] = useState({ text: '', visible: false })
  const [fullscreen, setFullscreen] = useState(false)
  const stacked = useMedia('(max-width: 1023px)')
  const canFullscreen = useSyncExternalStore(noSubscription, () => document.fullscreenEnabled, () => false)
  const Heading = variant === 'page' ? 'h2' : 'h3'

  const counts = useMemo(() => ({ all: objects.length, completed: objects.filter(o => o.status === 'completed').length, building: objects.filter(o => o.status === 'building').length }), [objects])
  const places = useMemo(() => new Set(objects.map(o => o.location.trim().toLowerCase()).filter(Boolean)).size, [objects])
  const visible = useMemo(() => objects.filter(o => filter === 'all' || o.status === filter), [objects, filter])
  const points = useMemo(() => objects.length ? visible.map(pointOf) : cityPoints, [objects.length, visible])
  const active = objects.find(o => o.id === selected)
  const preview = objects.find(o => o.id === previewId)
  const previewShown = hovered !== null && hovered === previewId && hovered !== selected
  const position = visible.findIndex(o => o.id === selected)

  const insets = useCallback((): Insets => {
    const box = panel.current?.getBoundingClientRect(), area = container.current?.getBoundingClientRect()
    if (stacked || !box || !area) return [16, 64, 16, 16]
    return [16, 72, 40, box.right - area.left + 8]
  }, [stacked])

  const flash = (kind: 'hint' | 'toast', text: string) => {
    const set = kind === 'hint' ? setHint : setToast
    set({ text, visible: true })
    window.clearTimeout(timers.current[kind])
    timers.current[kind] = window.setTimeout(() => set(current => ({ ...current, visible: false })), kind === 'hint' ? 1500 : 2600)
  }

  const hover = (id: number | null) => {
    if (stacked) return
    setHovered(id)
    if (id !== null) setPreviewId(id)
  }

  const scrollCarouselTo = (id: number) => {
    const strip = list.current, card = strip?.querySelector<HTMLElement>(`[data-id="${id}"]`)
    if (!strip || !card) return
    // Пока лента докручивается до карточки, промежуточные карточки не двигают карту.
    carousel.current.locked = true
    window.clearTimeout(timers.current.carousel)
    timers.current.carousel = window.setTimeout(() => { carousel.current.locked = false }, 900)
    strip.scrollTo({ left: card.offsetLeft - (strip.clientWidth - card.offsetWidth) / 2, behavior: 'smooth' })
  }

  const open = (id: number, from: 'map' | 'list') => {
    const object = objects.find(o => o.id === id)
    if (!object) return
    if (selected === null) opened.current.from = id
    opened.current.scroll = stacked
    opened.current.focus = true
    setSelected(id)
    setHovered(null)
    track('map_object_view', { status: object.status, from })
    if (from === 'list') focus(id, 13)
    else reveal(id)
  }

  const close = () => setSelected(null)

  const step = (direction: 1 | -1) => {
    const next = visible[(position + direction + visible.length) % visible.length]
    if (!next) return
    setSelected(next.id)
    focus(next.id, 12)
  }

  const pick = (point: MapPoint) => {
    if (point.kind === 'city') {
      const city = cities[point.id - 100_000]
      if (city) router.push(`/karkasnye-doma/${city.slug}`)
      return
    }
    // На телефоне отметка сначала показывает карточку в ленте, подробности — по нажатию на карточку.
    if (stacked && selected === null) { setHovered(point.id); scrollCarouselTo(point.id); return }
    open(point.id, 'map')
  }

  const { ready, failed, moving, view, zoomBy, fitAll, focus, reveal, pinRect } = useConstructionMap({
    apiKey, enabled: inView, container, points, active: selected, hovered, insets,
    onSelect: pick,
    onHover: hover,
    onHint: kind => flash('hint', kind === 'touch' ? 'Двигайте карту двумя пальцами' : `Для масштаба прокручивайте с ${/Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'Ctrl'}`),
  })

  const share = async (object: ConstructionObject) => {
    const url = new URL('/construction-map', window.location.origin)
    url.searchParams.set('object', String(object.id))
    if (demo) url.searchParams.set('demo', '1')
    track('map_share', { status: object.status })
    try {
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) await navigator.share({ title: object.name, url: url.href })
      else { await navigator.clipboard.writeText(url.href); flash('toast', 'Ссылка на дом скопирована') }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) flash('toast', 'Не получилось скопировать ссылку')
    }
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
    else void workspace.current?.requestFullscreen().catch(() => {})
  }

  // Яндекс Карты загружаются, только когда блок подъезжает к экрану.
  useEffect(() => {
    const element = workspace.current
    if (!element || inView) return
    const observer = new IntersectionObserver(([entry]) => { if (entry?.isIntersecting) setInView(true) }, { rootMargin: '600px 0px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [inView])

  // Esc закрывает карточку дома, где бы ни был фокус; открытый просмотр фото закрывается первым.
  useEffect(() => {
    if (selected === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || document.querySelector('dialog[open]')) return
      if ((event.target as HTMLElement | null)?.closest('input, textarea, select, [contenteditable="true"]')) return
      setSelected(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [selected])

  useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement === workspace.current)
    document.addEventListener('fullscreenchange', update)
    return () => document.removeEventListener('fullscreenchange', update)
  }, [])

  useEffect(() => {
    const store = timers.current
    return () => { window.clearTimeout(store.hint); window.clearTimeout(store.toast); window.clearTimeout(store.carousel) }
  }, [])

  useEffect(() => {
    if (variant !== 'page') return
    const url = new URL(window.location.href)
    if (selected === null) url.searchParams.delete('object')
    else url.searchParams.set('object', String(selected))
    if (url.href !== window.location.href) window.history.replaceState(null, '', url)
  }, [selected, variant])

  // Фокус: при открытии — на заголовок карточки, при закрытии — обратно на карточку в списке.
  useEffect(() => {
    const state = opened.current
    if (selected === null) {
      if (state.from !== null) list.current?.querySelector<HTMLElement>(`[data-id="${state.from}"]`)?.focus({ preventScroll: true })
      state.from = null
      return
    }
    if (state.scroll) details.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
    if (state.focus) heading.current?.focus({ preventScroll: true })
    state.scroll = false
    state.focus = false
  }, [selected])

  // Лента карточек на телефоне ведёт за собой карту: подсвечивается дом в центре ленты.
  useEffect(() => {
    const strip = list.current
    if (!stacked || selected !== null || !strip) return
    const touch = () => { carousel.current.touched = true }
    const observer = new IntersectionObserver(entries => {
      if (!carousel.current.touched || carousel.current.locked) return
      const entry = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      const id = Number((entry?.target as HTMLElement | undefined)?.dataset.id)
      if (!Number.isFinite(id)) return
      setHovered(id)
      reveal(id)
    }, { root: strip, threshold: 0.75 })
    strip.querySelectorAll('[data-id]').forEach(card => observer.observe(card))
    strip.addEventListener('pointerdown', touch, { passive: true })
    return () => { observer.disconnect(); strip.removeEventListener('pointerdown', touch) }
  }, [stacked, selected, visible, reveal])

  // Подсказка над отметкой позиционируется напрямую: без лишних перерисовок при движении карты.
  useLayoutEffect(() => {
    const element = tooltip.current, area = container.current
    if (!element || !area) return
    const rect = !stacked && previewShown && !moving && hovered !== null ? pinRect(hovered) : null
    if (!rect) { element.dataset.visible = 'false'; return }
    const box = area.getBoundingClientRect(), half = element.offsetWidth / 2 + 12
    const below = rect.top - box.top < element.offsetHeight + 24
    element.style.setProperty('--x', `${Math.round(Math.min(Math.max(rect.left + rect.width / 2 - box.left, half), box.width - half))}px`)
    element.style.setProperty('--y', `${Math.round((below ? rect.bottom : rect.top) - box.top)}px`)
    element.dataset.below = String(below)
    element.dataset.visible = 'true'
  }, [preview, previewShown, hovered, stacked, moving, view, pinRect])

  return <div className={cn(styles.root, variant === 'page' && styles.page)}>
    {demo && <p className={styles.notice}>Демонстрация интерфейса: объекты, координаты и суммы ниже — примеры, а не реальные стройки компании.</p>}
    <div ref={workspace} className={styles.workspace}>
      <div className={styles.mapArea}>
        <div ref={container} className={styles.map} data-focus={active ? true : undefined} role="region" aria-label="Карта построенных домов и текущих строек" />
        {!apiKey && <iframe className={styles.embed} title="Яндекс Карта Санкт-Петербурга и Ленинградской области" src="https://yandex.ru/map-widget/v1/?ll=30.15%2C60.15&z=8" loading="lazy" allowFullScreen />}
        {apiKey && <div className={styles.veil} data-hidden={ready || failed || undefined} aria-hidden><span className={styles.veilMark} /><span>Загружаем карту…</span></div>}
        {failed && <p className={styles.mapNotice}>Подложка карты не загрузилась. Все дома доступны в списке.</p>}
        {ready && <div className={styles.controls}>
          <div className={styles.zoom}>
            <button type="button" onClick={() => zoomBy(1)} aria-label="Приблизить" title="Приблизить"><LuPlus aria-hidden /></button>
            <button type="button" onClick={() => zoomBy(-1)} aria-label="Отдалить" title="Отдалить"><LuMinus aria-hidden /></button>
          </div>
          <button type="button" className={styles.control} onClick={fitAll} aria-label={objects.length ? 'Показать все дома' : 'Показать всю область'} title={objects.length ? 'Показать все дома' : 'Показать всю область'}><LuScan aria-hidden /></button>
          {canFullscreen && <button type="button" className={styles.control} onClick={toggleFullscreen} aria-label={fullscreen ? 'Свернуть карту' : 'Развернуть карту на весь экран'} title={fullscreen ? 'Свернуть' : 'На весь экран'}>{fullscreen ? <LuShrink aria-hidden /> : <LuExpand aria-hidden />}</button>}
        </div>}
        <div ref={tooltip} className={styles.tooltip} data-visible="false" aria-hidden>
          {preview && <>
            <span className={styles.tooltipPhoto}><ObjectPhoto key={preview.photos[0] ?? preview.id} src={preview.photos[0]} kind={preview.status} /></span>
            <span className={styles.tooltipText}>
              <strong>{preview.name}</strong>
              <small>{[statusText(preview), preview.area && `${preview.area} м²`, preview.location].filter(Boolean).join(' · ')}</small>
            </span>
          </>}
        </div>
        <p className={styles.hint} data-visible={hint.visible || undefined} aria-hidden>{hint.text}</p>
      </div>
      <aside ref={panel} className={styles.panel} data-mode={active ? 'details' : objects.length ? 'list' : 'empty'} aria-label="Дома на карте">
        {active ? <div ref={details} className={styles.detailsSlot}>
          <ObjectDetails key={active.id} object={active} project={projects.find(p => p.slug === active.project)} index={position} total={visible.length}
            heading={Heading} headingRef={heading} onClose={close} onStep={step} onShare={() => void share(active)} />
        </div> : objects.length ? <>
          <div className={styles.panelHead}>
            <Heading className={styles.panelTitle}>{counts.all} {plural(counts.all, ['дом', 'дома', 'домов'])} <span>на карте</span></Heading>
            <p className={styles.panelLead}>{places > 1 ? `В ${places} ${plural(places, ['населённом пункте', 'населённых пунктах', 'населённых пунктах'])} Петербурга и области` : 'Петербург и Ленинградская область'}</p>
            <Filters value={filter} counts={counts} onChange={value => { setFilter(value); setHovered(null) }} />
          </div>
          <ul ref={list} className={styles.list}>
            {visible.map(o => <li key={o.id}><ObjectCard object={o} highlighted={hovered === o.id} onOpen={() => open(o.id, 'list')} onHover={hover} /></li>)}
          </ul>
        </> : <EmptyState unavailable={unavailable} />}
      </aside>
      <p className={styles.toast} role="status" data-visible={toast.visible || undefined}>{toast.text}</p>
    </div>
  </div>
}
