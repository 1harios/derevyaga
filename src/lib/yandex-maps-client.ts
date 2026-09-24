type Coordinates = [number, number]
type Placemark = { events: { add(name: string, handler: () => void): void } }
export type YandexMap = {
  geoObjects: { add(item: Placemark): void; removeAll(): void }
  behaviors: { disable(name: string): void }
  container: { fitToViewport(): void }
  setCenter(center: Coordinates, zoom: number): void
  setBounds(bounds: Coordinates[], options: Record<string, unknown>): void
  destroy(): void
}
export type YandexMaps = {
  ready(success: () => void, failure: (error: unknown) => void): void
  Map: new (element: HTMLElement, state: Record<string, unknown>, options?: Record<string, unknown>) => YandexMap
  Placemark: new (coordinates: Coordinates, properties: Record<string, unknown>, options: Record<string, unknown>) => Placemark
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
