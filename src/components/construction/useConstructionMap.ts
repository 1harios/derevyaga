import { useCallback, useEffect, useEffectEvent, useRef, useState, type RefObject } from 'react'
import { loadYandexMaps, type Clusterer, type Coordinates, type LayoutInstance, type Placemark, type YandexMap } from '@/lib/yandex-maps-client'

export type MapPoint = {
  id: number
  lat: number
  lng: number
  kind: 'building' | 'completed' | 'city'
  /** Подпись отметки — только для городов: текст из кода сайта, не из CRM. */
  label?: string
}

/** Сколько места [сверху, справа, снизу, слева] занимают панели поверх карты. */
export type Insets = [number, number, number, number]
export type MapHint = 'wheel' | 'touch'
type Highlight = { active: number | null; hovered: number | null }
type Store = {
  map: YandexMap
  clusterer: Clusterer
  create: (point: MapPoint) => Placemark
  marks: Map<number, Placemark>
  /** Отметки текущего фильтра. */
  shown: Set<Placemark>
  /** Выбранный дом живёт вне кластеризатора, чтобы всегда быть виден. */
  solo: Placemark | null
  fitted: boolean
}

// HTML-шаблоны меток получают только числа и значения из кода сайта:
// названия объектов из CRM в разметку карты не попадают.
const pinTemplate = '<div class="cm-pin" data-pin="{{ properties.id }}" data-kind="{{ properties.kind }}"><span class="cm-pin__coin"><span class="cm-pin__icon"></span></span></div>'
const cityTemplate = '<div class="cm-city" data-pin="{{ properties.id }}"><span class="cm-city__dot"></span><span class="cm-city__label">{{ properties.label }}</span></div>'
const clusterTemplate = '<div class="cm-cluster" data-size="{{ properties.size }}"><span>{{ properties.geoObjects.length }}</span></div>'

/** Анимации карты возвращают промис; ошибка (например, карту уже закрыли) не важна. */
const quiet = (promise: PromiseLike<unknown>) => promise.then(undefined, () => {})

function paint(element: HTMLElement, { active, hovered }: Highlight) {
  const id = Number(element.dataset.pin)
  element.classList.toggle('is-active', id === active)
  element.classList.toggle('is-hover', id === hovered && id !== active)
}

/** Ставит точку в центр свободной от панелей части карты. */
function centerOn(map: YandexMap, point: MapPoint, zoom: number, [top, right, bottom, left]: Insets, duration: number) {
  const projection = map.options.get('projection')
  const [x, y] = projection.toGlobalPixels([point.lat, point.lng], zoom)
  return quiet(map.setCenter(projection.fromGlobalPixels([x - (left - right) / 2, y - (top - bottom) / 2], zoom), zoom, { duration, checkZoomRange: true }))
}

const margin = (insets: Insets) => insets.map(inset => inset + 32)

function fit(map: YandexMap, points: MapPoint[], insets: Insets, duration: number) {
  if (points.length === 1) return centerOn(map, points[0], 11, insets, duration)
  if (!points.length) return
  const lats = points.map(p => p.lat), lngs = points.map(p => p.lng)
  return quiet(map.setBounds([[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]], { checkZoomRange: true, duration, zoomMargin: margin(insets) }))
}

/** Масштаб колесом с Ctrl (и щипком тачпада): точка под курсором остаётся на месте. */
function zoomAround(map: YandexMap, element: HTMLElement, event: WheelEvent) {
  const from = map.getZoom(), to = Math.min(17, Math.max(6, from + (event.deltaY < 0 ? 1 : -1)))
  if (to === from) return
  const rect = element.getBoundingClientRect(), projection = map.options.get('projection')
  const dx = event.clientX - rect.left - rect.width / 2, dy = event.clientY - rect.top - rect.height / 2
  const [cx, cy] = map.getGlobalPixelCenter()
  const [x, y] = projection.toGlobalPixels(projection.fromGlobalPixels([cx + dx, cy + dy], from), to)
  quiet(map.setCenter(projection.fromGlobalPixels([x - dx, y - dy], to), to, { duration: 220 }))
}

export function useConstructionMap({ apiKey, enabled, container, points, active, hovered, insets, onSelect, onHover, onHint }: {
  apiKey?: string
  /** Карта грузится, только когда блок подъезжает к экрану. */
  enabled: boolean
  container: RefObject<HTMLDivElement | null>
  points: MapPoint[]
  active: number | null
  hovered: number | null
  insets: () => Insets
  onSelect: (point: MapPoint) => void
  onHover: (id: number | null) => void
  onHint: (hint: MapHint) => void
}) {
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [moving, setMoving] = useState(false)
  // Растёт после каждого перемещения карты: по нему пересчитывается подсказка над меткой.
  const [view, setView] = useState(0)
  const store = useRef<Store | null>(null)
  const highlight = useRef<Highlight>({ active, hovered })
  const select = useEffectEvent((point: MapPoint) => onSelect(point))
  const hover = useEffectEvent((id: number | null) => onHover(id))
  const hint = useEffectEvent((kind: MapHint) => onHint(kind))
  const currentInsets = useEffectEvent(() => insets())

  useEffect(() => {
    const element = container.current
    if (!apiKey || !enabled || !element) return
    let cancelled = false
    let detach = () => {}
    loadYandexMaps(apiKey).then(api => {
      if (cancelled) return
      const map = new api.Map(element, { center: [60.15, 30.15], zoom: 8, controls: [] }, { yandexMapDisablePoiInteractivity: true, suppressObsoleteBrowserNotifier: true, minZoom: 6, maxZoom: 17 })
      const touch = window.matchMedia('(pointer: coarse)').matches
      map.behaviors.disable('scrollZoom')
      // На телефоне страница листается одним пальцем, карта двигается двумя.
      if (touch) map.behaviors.disable('drag')
      const layout = (template: string) => {
        const Layout = api.templateLayoutFactory.createClass(template, {
          build(this: LayoutInstance) {
            Layout.superclass.build.call(this)
            const pin = this.getParentElement()?.querySelector<HTMLElement>('[data-pin]')
            if (pin) paint(pin, highlight.current)
          },
        })
        return Layout
      }
      const pinLayout = layout(pinTemplate), cityLayout = layout(cityTemplate)
      const clusterer = new api.Clusterer({
        clusterIconLayout: api.templateLayoutFactory.createClass(clusterTemplate),
        clusterIconShape: { type: 'Circle', coordinates: [0, 0], radius: 28 },
        groupByCoordinates: false, clusterDisableClickZoom: false, hasBalloon: false, hasHint: false,
        gridSize: 96, maxZoom: 14,
      })
      // Размер кластера растёт вместе с числом домов в нём.
      clusterer.createCluster = function (this: Clusterer, center: Coordinates, geoObjects: Placemark[]) {
        const cluster = api.Clusterer.prototype.createCluster.call(this, center, geoObjects)
        cluster.properties.set({ size: geoObjects.length < 10 ? 's' : geoObjects.length < 100 ? 'm' : 'l' })
        return cluster
      }
      map.geoObjects.add(clusterer)
      const create = (point: MapPoint) => {
        const isCity = point.kind === 'city'
        const mark = new api.Placemark([point.lat, point.lng], { id: point.id, kind: point.kind, label: point.label ?? '' }, {
          iconLayout: isCity ? cityLayout : pinLayout,
          iconShape: isCity ? { type: 'Rectangle', coordinates: [[-12, -14], [Array.from(point.label ?? '').length * 8 + 30, 14]] } : { type: 'Circle', coordinates: [0, 0], radius: 23 },
          hasBalloon: false, hasHint: false, openBalloonOnClick: false,
        })
        mark.events.add('click', () => select(point))
        mark.events.add('mouseenter', () => hover(point.id))
        mark.events.add('mouseleave', () => hover(null))
        return mark
      }
      // Клик по кластеру приближает его так, чтобы дома не прятались под панелью.
      const margins = () => clusterer.options.set({ zoomMargin: margin(currentInsets()) })
      margins()
      const begin = () => setMoving(true)
      const end = () => { setMoving(false); setView(value => value + 1) }
      const changed = () => setView(value => value + 1)
      map.events.add('actionbegin', begin)
      map.events.add('actionend', end)
      map.events.add('boundschange', changed)
      map.events.add('sizechange', margins)
      let lastWheel = -Infinity
      const wheel = (event: WheelEvent) => {
        if (!event.ctrlKey && !event.metaKey) return hint('wheel')
        event.preventDefault()
        if (event.timeStamp - lastWheel < 200) return
        lastWheel = event.timeStamp
        zoomAround(map, element, event)
      }
      const swipe = (event: TouchEvent) => { if (touch && event.touches.length === 1) hint('touch') }
      element.addEventListener('wheel', wheel, { passive: false, capture: true })
      element.addEventListener('touchmove', swipe, { passive: true, capture: true })
      const observer = new ResizeObserver(() => map.container.fitToViewport())
      observer.observe(element)
      store.current = { map, clusterer, create, marks: new Map(), shown: new Set(), solo: null, fitted: false }
      detach = () => {
        observer.disconnect()
        element.removeEventListener('wheel', wheel, { capture: true })
        element.removeEventListener('touchmove', swipe, { capture: true })
        map.destroy()
      }
      setReady(true)
    }).catch(() => { if (!cancelled) setFailed(true) })
    return () => { cancelled = true; store.current = null; detach() }
  }, [apiKey, enabled, container])

  // Набор отметок: кластеризатор пересобирается при смене фильтра.
  useEffect(() => {
    const current = store.current
    if (!ready || !current) return
    const { map, clusterer, marks } = current
    const list = points.map(point => {
      const known = marks.get(point.id)
      if (known) return known
      const created = current.create(point)
      marks.set(point.id, created)
      return created
    })
    clusterer.removeAll()
    if (current.solo) map.geoObjects.remove(current.solo)
    const selected = highlight.current.active === null ? undefined : marks.get(highlight.current.active)
    current.solo = selected && list.includes(selected) ? selected : null
    clusterer.add(list.filter(mark => mark !== current.solo))
    if (current.solo) map.geoObjects.add(current.solo)
    current.shown = new Set(list)
    const first = !current.fitted
    const shownAll = fit(map, points, currentInsets(), first ? 0 : 450)
    current.fitted = true
    // Открыли по ссылке на дом: сначала обзор области, затем карта подлетает к дому.
    const target = first && current.solo ? points.find(point => point.id === highlight.current.active) : undefined
    if (target) void Promise.resolve(shownAll).then(() => { if (store.current === current) return centerOn(map, target, 13, currentInsets(), 800) })
  }, [ready, points])

  useEffect(() => {
    highlight.current = { active, hovered }
    const current = store.current
    if (!ready || !current) return
    const { map, clusterer, marks, shown } = current
    container.current?.querySelectorAll<HTMLElement>('[data-pin]').forEach(element => paint(element, highlight.current))
    marks.forEach((mark, id) => { if (id === active || id === hovered) mark.options.set({ zIndex: id === active ? 900 : 800 }); else mark.options.unset('zIndex') })
    const next = active === null ? undefined : marks.get(active)
    const target = next && shown.has(next) ? next : null
    if (target === current.solo) return
    if (current.solo) { map.geoObjects.remove(current.solo); if (shown.has(current.solo)) clusterer.add(current.solo) }
    if (target) { clusterer.remove(target); map.geoObjects.add(target) }
    current.solo = target
  }, [ready, active, hovered, container])

  const zoomBy = useCallback((step: number) => {
    const map = store.current?.map
    if (map) quiet(map.setZoom(map.getZoom() + step, { checkZoomRange: true, duration: 250 }))
  }, [])
  const fitAll = useCallback(() => {
    const map = store.current?.map
    if (map) fit(map, points, insets(), 450)
  }, [points, insets])
  /** Показать дом: при выборе из списка карта приближается к нему. */
  const focus = useCallback((id: number, zoom = 0) => {
    const map = store.current?.map, point = points.find(p => p.id === id)
    if (map && point) centerOn(map, point, Math.max(map.getZoom(), zoom), insets(), 500)
  }, [points, insets])
  /** Сдвинуть карту, только если отметка спрятана под панелью или за краем. */
  const reveal = useCallback((id: number) => {
    const map = store.current?.map, point = points.find(p => p.id === id), element = container.current
    if (!map || !point || !element) return
    const [top, right, bottom, left] = insets()
    const [x, y] = map.options.get('projection').toGlobalPixels([point.lat, point.lng], map.getZoom())
    const [cx, cy] = map.getGlobalPixelCenter()
    const px = x - cx + element.clientWidth / 2, py = y - cy + element.clientHeight / 2
    if (px < left + 40 || px > element.clientWidth - right - 40 || py < top + 40 || py > element.clientHeight - bottom - 40) centerOn(map, point, map.getZoom(), [top, right, bottom, left], 450)
  }, [points, insets, container])
  const pinRect = useCallback((id: number) => container.current?.querySelector(`[data-pin="${id}"]`)?.getBoundingClientRect() ?? null, [container])

  return { ready, failed, moving, view, zoomBy, fitAll, focus, reveal, pinRect }
}
