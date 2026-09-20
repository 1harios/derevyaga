'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { LuMinus, LuPlus, LuRotateCcw } from 'react-icons/lu'
import { constructorConfig as cfg } from '@/lib/constructor/config'
import type { ConstructorInput } from '@/lib/constructor/engine'
import { houseDimensions, photoLayers, sceneGeometry, sceneSize } from './photo-scenes'

const decoded = new Map<string, Promise<void>>()
function preload(src: string) {
  let promise = decoded.get(src)
  if (!promise) {
    promise = new Promise<void>((resolve, reject) => {
      const image = new window.Image()
      image.onload = () => image.decode().then(resolve, reject)
      image.onerror = () => reject(new Error(src))
      image.src = src
    }).catch(error => { decoded.delete(src); throw error })
    decoded.set(src, promise)
  }
  return promise
}

function HouseScene({ input, clipId }: { input: ConstructorInput; clipId: string }) {
  const geometry = sceneGeometry[sceneSize(input)]
  const layers = photoLayers(input)
  const dimensions = houseDimensions(input)
  return <svg viewBox="0 0 1536 1024" data-size={input.size} data-facade={input.facade} data-terrace={input.terrace} className="photo-house-composite" role="img" aria-label={dimensions ? `Дом: ширина ${dimensions.width} м, глубина ${dimensions.depth} м` : 'Пример дома 6×6 для индивидуального размера'}>
    <defs>
      {(['roof', 'foundation'] as const).map(part => <clipPath key={part} id={`${clipId}-${part}`}><polygon points={geometry[part]} /></clipPath>)}
    </defs>
    <image href={layers.base} width="1536" height="1024" data-layer="base" />
    {(['foundation', 'roof'] as const).map(part => layers[part] && <image key={part} href={layers[part]!} width="1536" height="1024" clipPath={`url(#${clipId}-${part})`} data-layer={part} />)}

  </svg>
}

export function PhotoHouse({ input }: { input: ConstructorInput }) {
  const [zoom, setZoom] = useState(1)
  const [shown, setShown] = useState<ConstructorInput | null>(null)
  const [failed, setFailed] = useState(false)
  const [retry, setRetry] = useState(0)
  const id = useId().replace(/:/g, '')
  const latest = useRef(input)
  latest.current = input
  const requested = JSON.stringify([input.size, photoLayers(input)])

  useEffect(() => {
    let active = true
    const snapshot = latest.current
    const sources = Object.values(photoLayers(snapshot)).filter((src): src is string => !!src)
    Promise.all(sources.map(preload)).then(() => {
      if (active) { setShown(snapshot); setFailed(false) }
    }).catch(() => { if (active) setFailed(true) })
    return () => { active = false }
  }, [requested, retry])

  const pending = !shown || JSON.stringify([shown.size, photoLayers(shown)]) !== requested

  const displayed = shown ?? input
  const size = cfg.sizes.find(item => item.id === displayed.size)!
  const roof = cfg.roofs.find(item => item.id === displayed.roof)!.label
  const facade = cfg.facades.find(item => item.id === displayed.facade)!.label
  return <figure className="photo-house" aria-label="Визуализация выбранного дома" aria-busy={pending}>
    <div className="photo-house-picture" style={{ transform: `scale(${zoom})` }}>
      {shown && <HouseScene key={JSON.stringify([shown.size, photoLayers(shown)])} input={shown} clipId={id} />}
    </div>
    <figcaption className="photo-house-title">
      <div className="photo-house-heading"><strong>{displayed.size === 'custom' ? 'Индивидуальный размер' : `Дом ${size.label}`}</strong>{displayed.size !== 'custom' && <small> · {size.area} м²</small>}</div>
      <span>{displayed.size === 'custom' ? 'Пример 6×6 м · ваши размеры согласуем' : 'Ширина × глубина'}</span>
      <span className="photo-house-materials">{roof} · {facade}</span>
    </figcaption>
    {pending && <div className="photo-house-loading" role="status">{failed ? <button type="button" onClick={() => setRetry(n => n + 1)}>Повторить загрузку изображения</button> : 'Обновляем вид дома…'}</div>}
    <div className="photo-house-tools" aria-label="Масштаб изображения">
      <button type="button" aria-label="Приблизить дом" disabled={zoom >= 1.8} onClick={() => setZoom(n => Math.min(1.8, n + .2))}><LuPlus/></button>
      <button type="button" aria-label="Отдалить дом" disabled={zoom <= 1} onClick={() => setZoom(n => Math.max(1, n - .2))}><LuMinus/></button>
      <button type="button" aria-label="Сбросить масштаб" onClick={() => setZoom(1)}><LuRotateCcw/></button>
    </div>
  </figure>
}
