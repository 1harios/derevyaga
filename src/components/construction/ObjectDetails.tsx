'use client'

import { useRef, useState, type RefObject } from 'react'
import Link from 'next/link'
import { LuArrowLeft, LuArrowRight, LuCalendarCheck, LuMapPin, LuMaximize2, LuShare2 } from 'react-icons/lu'
import { ArrowIcon, Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { ConstructionObject, MapProject } from '@/lib/construction-objects'
import { formatPrice } from '@/lib/utils'
import styles from './ConstructionMap.module.css'

type Status = ConstructionObject['status']

/** Без фото — фирменная заглушка: знак Деревяги у готового дома, каркас у стройки. */
export function ObjectPhoto({ src, alt = '', eager = false, kind = 'completed' }: { src?: string; alt?: string; eager?: boolean; kind?: Status }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return <span className={styles.noPhoto} data-kind={kind}><i aria-hidden /><span>Фотографии скоро появятся</span></span>
  // Фото приходят по публичным ссылкам из CRM и показываются без серверного прокси.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" draggable={false} onError={() => setFailed(true)} />
}

export const StatusChip = ({ status, onPhoto = false }: { status: Status; onPhoto?: boolean }) =>
  <span className={styles.chip} data-status={status} data-on-photo={onPhoto || undefined}><i aria-hidden />{status === 'completed' ? 'Построен' : 'Строится'}</span>

export const statusText = (object: ConstructionObject) => object.status === 'building' ? 'Строится' : object.year ? `Построен в ${object.year}` : 'Построен'

const smooth = (): ScrollBehavior => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'

function Gallery({ object, onClose, onShare }: { object: ConstructionObject; onClose: () => void; onShare: () => void }) {
  const { photos, name, status } = object
  const track = useRef<HTMLDivElement>(null)
  const swipe = useRef<number | null>(null)
  const [index, setIndex] = useState(0)
  const [viewer, setViewer] = useState<number | null>(null)
  const go = (next: number) => {
    const element = track.current
    if (element) element.scrollTo({ left: ((next + photos.length) % photos.length) * element.clientWidth, behavior: smooth() })
  }
  const view = (step: number) => setViewer(current => current === null ? null : (current + step + photos.length) % photos.length)
  return <div className={styles.gallery} onKeyDown={event => {
    if (viewer === null || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return
    event.preventDefault(); view(event.key === 'ArrowRight' ? 1 : -1)
  }}>
    <div className={styles.media}>
      <div ref={track} className={styles.track} onScroll={event => setIndex(Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth))}>
        {photos.length ? photos.map((src, i) => <button key={`${i}-${src}`} type="button" className={styles.slide} onClick={() => setViewer(i)} aria-label={`Открыть фото ${i + 1} из ${photos.length} крупно`}>
          <ObjectPhoto src={src} alt={`${name} — фото ${i + 1}`} eager={i === 0} kind={status} />
        </button>) : <div className={styles.slide}><ObjectPhoto kind={status} /></div>}
      </div>
      <div className={styles.galleryTop}>
        <button type="button" className={styles.back} onClick={onClose}><LuArrowLeft aria-hidden />Все дома</button>
        <button type="button" className={styles.roundButton} onClick={onShare} aria-label="Поделиться ссылкой на дом" title="Поделиться"><LuShare2 aria-hidden /></button>
      </div>
      {photos.length > 1 && <div className={styles.galleryNav}>
        <span className={styles.counter} aria-live="polite">{index + 1} / {photos.length}</span>
        <span className={styles.galleryArrows}>
          <button type="button" className={styles.roundButton} onClick={() => go(index - 1)} aria-label="Предыдущее фото"><LuArrowLeft aria-hidden /></button>
          <button type="button" className={styles.roundButton} onClick={() => go(index + 1)} aria-label="Следующее фото"><LuArrowRight aria-hidden /></button>
        </span>
      </div>}
    </div>
    {photos.length > 1 && <div className={styles.thumbs}>
      {photos.map((src, i) => <button key={`${i}-${src}`} type="button" aria-label={`Фото ${i + 1}`} aria-current={index === i} onClick={() => go(i)}><ObjectPhoto src={src} kind={status} /></button>)}
    </div>}
    <Modal open={viewer !== null} onClose={() => setViewer(null)} title={`${name} · фото ${(viewer ?? 0) + 1} из ${photos.length}`} size="gallery">
      {viewer !== null && <>
        <div className={styles.viewer} onPointerDown={event => { swipe.current = event.clientX }} onPointerUp={event => {
          if (swipe.current !== null && Math.abs(event.clientX - swipe.current) > 50) view(event.clientX < swipe.current ? 1 : -1)
          swipe.current = null
        }}>
          <ObjectPhoto key={photos[viewer]} src={photos[viewer]} alt={`${name} — фото ${viewer + 1}`} eager kind={status} />
        </div>
        {photos.length > 1 && <div className={styles.viewerControls}>
          <button type="button" onClick={() => view(-1)} aria-label="Предыдущее фото"><LuArrowLeft aria-hidden /></button>
          <span>{viewer + 1} / {photos.length}</span>
          <button type="button" onClick={() => view(1)} aria-label="Следующее фото"><LuArrowRight aria-hidden /></button>
        </div>}
      </>}
    </Modal>
  </div>
}

export function ObjectDetails({ object, project, index, total, heading: Heading, headingRef, onClose, onStep, onShare }: {
  object: ConstructionObject
  project?: MapProject
  index: number
  total: number
  heading: 'h2' | 'h3'
  headingRef: RefObject<HTMLHeadingElement | null>
  onClose: () => void
  onStep: (direction: 1 | -1) => void
  onShare: () => void
}) {
  const Subheading = Heading === 'h2' ? 'h3' : 'h4'
  const building = object.status === 'building'
  // Характеристики — как на странице проекта: иконка, подпись и значение под тонкой линией.
  const specs = [
    object.area ? { icon: LuMaximize2, label: 'Площадь', value: `${object.area.toLocaleString('ru-RU')} м²` } : null,
    { icon: LuMapPin, label: 'Место', value: object.location || 'Ленинградская область' },
    object.year ? { icon: LuCalendarCheck, label: 'Сдан', value: `в ${object.year} году` } : null,
  ].filter(spec => spec !== null)
  return <article className={styles.details} aria-label={object.name}>
    <div className={styles.detailScroll}>
      <Gallery object={object} onClose={onClose} onShare={onShare} />
      <div className={styles.detailBody}>
        <StatusChip status={object.status} />
        <Heading ref={headingRef} tabIndex={-1} className={styles.detailTitle}>{object.name}</Heading>
        <dl className={styles.specs}>
          {specs.map(spec => <div key={spec.label}><spec.icon aria-hidden /><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}
        </dl>
        {object.price && <p className={styles.price}><span>Стоимость дома и работ</span><strong>{formatPrice(object.price)}</strong></p>}
        {object.description && <p className={styles.description}>{object.description}</p>}
        {object.works.length > 0 && <div className={styles.works}>
          <Subheading className={styles.worksTitle}>{building ? 'Что уже сделано' : 'Выполненные работы'}<span>{object.works.length}</span></Subheading>
          <ol>{object.works.map((work, i) => <li key={i}><span>{String(i + 1).padStart(2, '0')}</span>{work}</li>)}</ol>
        </div>}
        {project && <Link href={`/projects/${project.slug}`} className={styles.projectLink}>
          <span className={styles.projectImage}><ObjectPhoto src={project.photo} /></span>
          <span className={styles.projectText}>
            <small>{building ? 'Строится по проекту' : 'Построен по проекту'}</small>
            <strong>Дом «{project.name}»</strong>
            <span>{project.area} м² · от {formatPrice(project.priceFrom)}</span>
          </span>
          <span className={styles.projectArrow} aria-hidden><ArrowIcon /></span>
        </Link>}
      </div>
    </div>
    <div className={styles.detailFooter}>
      {total > 1 && <div className={styles.stepper}>
        <button type="button" onClick={() => onStep(-1)} aria-label="Предыдущий дом" title="Предыдущий дом"><LuArrowLeft aria-hidden /></button>
        <span>{index + 1} / {total}</span>
        <button type="button" onClick={() => onStep(1)} aria-label="Следующий дом" title="Следующий дом"><LuArrowRight aria-hidden /></button>
      </div>}
      <Button href="#final-form" size="sm" arrow className={styles.cta}>Хочу похожий дом</Button>
    </div>
  </article>
}
