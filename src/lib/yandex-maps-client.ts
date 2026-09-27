export type Coordinates = [number, number]
type Handler = () => void
type Events = { add(name: string, handler: Handler): void; remove(name: string, handler: Handler): void }
type Options = { get(name: string): unknown; set(options: Record<string, unknown>): void; unset(name: string): void }
type Properties = { get(name: string): unknown; set(values: Record<string, unknown>): void }
type Motion = { duration?: number; checkZoomRange?: boolean }
export type Projection = { toGlobalPixels(coordinates: Coordinates, zoom: number): Coordinates; fromGlobalPixels(pixels: Coordinates, zoom: number): Coordinates }
export type Placemark = { events: Events; options: Options; properties: Properties }
export type Clusterer = {
  options: Options
  add(objects: Placemark | Placemark[]): void
  remove(object: Placemark): void
  removeAll(): void
  createCluster(center: Coordinates, geoObjects: Placemark[]): Placemark
}
/** Класс макета из templateLayoutFactory: передаётся в опции меток как есть. */
export type LayoutClass = { superclass: { build(this: unknown): void; clear(this: unknown): void } }
export type LayoutInstance = { getParentElement(): HTMLElement | null }
export type YandexMap = {
  events: Events
  options: { get(name: 'projection'): Projection }
  getGlobalPixelCenter(): Coordinates
  getZoom(): number
  getBounds(): [Coordinates, Coordinates]
  geoObjects: { add(item: Placemark | Clusterer): void; remove(item: Placemark): void; removeAll(): void }
  behaviors: { disable(name: string): void }
  container: { fitToViewport(): void }
  setCenter(center: Coordinates, zoom?: number, options?: Motion): Promise<void>
  setZoom(zoom: number, options?: Motion): Promise<void>
  setBounds(bounds: Coordinates[], options: Motion & { zoomMargin?: number[] }): Promise<void>
  panTo(center: Coordinates, options?: Motion & { flying?: boolean }): Promise<void>
  destroy(): void
}
export type YandexMaps = {
  ready(success: () => void, failure: (error: unknown) => void): void
  Map: new (element: HTMLElement, state: Record<string, unknown>, options?: Record<string, unknown>) => YandexMap
  Placemark: new (coordinates: Coordinates, properties: Record<string, unknown>, options: Record<string, unknown>) => Placemark
  Clusterer: { new (options: Record<string, unknown>): Clusterer; prototype: Clusterer }
  templateLayoutFactory: { createClass(template: string, overrides?: Record<string, unknown>): LayoutClass }
}
declare global { interface Window { ymaps?: YandexMaps } }
let loading: Promise<YandexMaps> | undefined

export function loadYandexMaps(key: string): Promise<YandexMaps> {
  if (loading) return loading
  loading = new Promise<YandexMaps>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error('Yandex Maps timeout')), 20000)
    const fail = (error: unknown) => { clearTimeout(timeout); reject(error) }
    const ready = () => {
      if (!window.ymaps) return fail(new Error('Yandex Maps unavailable'))
      window.ymaps.ready(() => { clearTimeout(timeout); resolve(window.ymaps!) }, fail)
    }
    if (window.ymaps) return ready()
    const script = document.createElement('script')
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(key)}&lang=ru_RU`
    script.async = true
    script.onload = ready
    script.onerror = () => { script.remove(); fail(new Error('Yandex Maps load failed')) }
    document.head.appendChild(script)
  }).catch(error => { loading = undefined; throw error })
  return loading
}
