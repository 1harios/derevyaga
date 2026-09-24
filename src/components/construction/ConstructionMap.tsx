'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { loadYandexMaps, type YandexMap, type YandexMaps } from '@/lib/yandex-maps-client'
import { LuCheck, LuHouse, LuMapPin, LuX } from 'react-icons/lu'
import type { ConstructionObject } from '@/lib/construction-objects'
import { formatPrice } from '@/lib/utils'

import styles from './ConstructionMap.module.css'

const labels = { building: 'Строится', completed: 'Построен' }

export function ConstructionMap({ objects, unavailable = false, demo = false }: { objects: ConstructionObject[]; unavailable?: boolean; demo?: boolean }) {
  const container = useRef<HTMLDivElement>(null)
  const detailPanel = useRef<HTMLDivElement>(null)
  const map = useRef<YandexMap | null>(null)
  const api = useRef<YandexMaps | null>(null)
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY?.trim()
  const [ready, setReady] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [embedLoaded, setEmbedLoaded] = useState(false)
  const [filter, setFilter] = useState<'all' | ConstructionObject['status']>('all')
  const [selected, setSelected] = useState<number | null>(null)
  const [photo, setPhoto] = useState(0)
  const visible = useMemo(() => objects.filter(o => filter === 'all' || o.status === filter), [objects, filter])
  const active = visible.find(o => o.id === selected)

  useEffect(() => {
    if (active && window.matchMedia('(max-width:850px)').matches) detailPanel.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, [active])

  useEffect(() => {
    if (!apiKey) return
    let cancelled = false
    let observer: ResizeObserver | undefined
    loadYandexMaps(apiKey).then(ymaps => {
      if (cancelled || !container.current) return
      api.current = ymaps
      const instance = new ymaps.Map(container.current, { center: [60.15, 30.15], zoom: 8, controls: ['zoomControl'] }, { zoomControlPosition: { right: 20, top: 80 } })
      instance.behaviors.disable('scrollZoom')
      map.current = instance
      observer = new ResizeObserver(() => instance.container.fitToViewport())
      observer.observe(container.current)
      setReady(true)
    }).catch(() => { if (!cancelled) setMapError(true) })
    return () => { cancelled = true; observer?.disconnect(); map.current?.destroy(); map.current = null }
  }, [apiKey])

  useEffect(() => {
    if (!ready || !map.current || !api.current) return
    const instance = map.current
    instance.geoObjects.removeAll()
    visible.forEach(o => {
      const marker = new api.current!.Placemark([o.lat, o.lng], {}, {
        preset: 'islands#homeIcon', iconColor: o.status === 'building' ? '#ad7440' : '#4e6254',
      })
      marker.events.add('click', () => { setSelected(o.id); setPhoto(0) })
      instance.geoObjects.add(marker)
    })
    if (visible.length === 1) instance.setCenter([visible[0].lat, visible[0].lng], 11)
    else if (visible.length > 1) instance.setBounds([
      [Math.min(...visible.map(o => o.lat)), Math.min(...visible.map(o => o.lng))],
      [Math.max(...visible.map(o => o.lat)), Math.max(...visible.map(o => o.lng))],
    ], { checkZoomRange: true, zoomMargin: window.innerWidth > 850 ? [60, 60, 80, 420] : [40, 40, 60, 40] })
  }, [visible, ready])
  const choose = (o: ConstructionObject) => {
    setSelected(o.id); setPhoto(0)
    map.current?.setCenter([o.lat, o.lng], 12)
  }

  return <div className={styles.root}>
    {demo && <p className={styles.notice}>Демонстрация интерфейса. Объекты, координаты и суммы ниже — примеры, не реальные стройки компании.</p>}
    <div className={styles.workspace}>
      <div className={styles.mapArea}>
        <div ref={container} className={styles.map} aria-label="Карта построенных домов и текущих строек" />
        {!apiKey && <iframe className={styles.embed} title="Яндекс Карта Санкт-Петербурга и Ленинградской области" src="https://yandex.ru/map-widget/v1/?ll=30.15%2C60.15&z=8" loading="lazy" allowFullScreen onLoad={() => setEmbedLoaded(true)} />}
        {!apiKey && !embedLoaded && <div className={styles.loading}>Загружаем Яндекс Карту…<a href="https://yandex.ru/maps/?ll=30.15%2C60.15&z=8" target="_blank" rel="noopener noreferrer">Открыть в Яндекс Картах ↗</a></div>}
        {mapError && <p className={styles.mapNotice}>Подложка карты недоступна. Объекты можно открыть в списке.</p>}
        <div className={styles.filters} role="group" aria-label="Статус объекта">
          {(['all', 'completed', 'building'] as const).map(status => <button key={status} type="button" aria-pressed={filter === status} onClick={() => { setFilter(status); setSelected(null) }}>
            {status === 'all' ? 'Все объекты' : status === 'completed' ? 'Построены' : 'Строятся'}
            <span className={styles.count}>{objects.filter(o => status === 'all' || o.status === status).length}</span>
          </button>)}
        </div>
      </div>
      <aside className={styles.sidebar} aria-label="Объекты строительства">
        {active ? <div ref={detailPanel} className={styles.details}>
          <div className={styles.detailHeader}><span className={styles.status}>{labels[active.status]}</span><button type="button" aria-label="Закрыть карточку объекта" onClick={() => setSelected(null)}><LuX /></button></div>
          <h2>{active.name}</h2><p className={styles.location}><LuMapPin aria-hidden />{active.location || 'Ленинградская область'}</p>
          {active.photos.length ? <div className={styles.gallery}>
            {/* CRM images are rendered directly; no server image proxy for arbitrary URLs. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={active.photos[photo] ?? active.photos[0]} src={active.photos[photo] ?? active.photos[0]} alt={`${active.name} — фото ${photo + 1}`} onError={e => { e.currentTarget.style.visibility = 'hidden' }} />
            {active.photos.length > 1 && <div className={styles.photoNav}><button type="button" aria-label="Предыдущее фото" onClick={() => setPhoto((photo + active.photos.length - 1) % active.photos.length)}>←</button><span>{photo + 1} / {active.photos.length}</span><button type="button" aria-label="Следующее фото" onClick={() => setPhoto((photo + 1) % active.photos.length)}>→</button></div>}
          </div> : <div className={styles.noPhoto}><LuHouse /><span>Фотографии скоро появятся</span></div>}
          <div className={styles.facts}>{active.area && <div><small>Площадь</small><strong>{active.area} м²</strong></div>}{active.price && <div><small>Стоимость работ и дома</small><strong>{formatPrice(active.price)}</strong></div>}</div>
          {active.description && <p className={styles.description}>{active.description}</p>}
          {!!active.works.length && <><h3>Выполненные работы</h3><ul className={styles.works}>{active.works.map((work, i) => <li key={i}><LuCheck aria-hidden />{work}</li>)}</ul></>}
          <Link href="/#final-form" className={styles.cta}>Обсудить похожий дом ↗</Link>
        </div> : <div className={styles.list}>
          <h2>Дома на карте <span>{visible.length}</span></h2>
          <p>{apiKey ? 'Выберите отметку на карте или объект в списке.' : 'Фотографии и подробности — в карточках объектов.'}</p>
          {visible.map(o => <button key={o.id} type="button" className={styles.listItem} onClick={() => choose(o)}><span className={styles.listIcon}><LuHouse /></span><span><strong>{o.name}</strong><small>{o.location}</small><small className={o.status === 'building' ? styles.buildingText : ''}>{labels[o.status]}</small></span><span aria-hidden>↗</span></button>)}
          {!visible.length && <div className={styles.empty}><LuMapPin /><h3>{unavailable ? 'Объекты временно недоступны' : objects.length ? 'Ничего не найдено' : 'Готовим карту наших домов'}</h3><p>{unavailable ? 'Попробуйте обновить страницу позже.' : objects.length ? 'Выберите другой статус.' : 'Здесь появятся фотографии, этапы строительства и истории готовых домов.'}</p></div>}
        </div>}
      </aside>
    </div>
  </div>
}
