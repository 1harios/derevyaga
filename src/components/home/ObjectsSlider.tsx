'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { builtObjects } from '@/content/objects'
import { cn, formatPrice, pluralized } from '@/lib/utils'

export function ObjectsSlider() {
  const [activeIndex, setActiveIndex] = useState(0)
  const object = builtObjects[activeIndex]
  const diff = object.actualDays - object.plannedDays
  const delayed = diff > 0
  const track = Math.max(object.plannedDays, object.actualDays)
  const plannedShare = (Math.min(object.plannedDays, object.actualDays) / track) * 100
  const delayShare = delayed ? 100 - plannedShare : 0

  const statusLabel = delayed
    ? `Задержка ${pluralized(diff, ['день', 'дня', 'дней'])}`
    : diff < 0
      ? `Раньше на ${pluralized(Math.abs(diff), ['день', 'дня', 'дней'])}`
      : 'Точно в срок'

  const scheduleNote = object.delayNote
    ?? (diff < 0
      ? `Дом сдан на ${pluralized(Math.abs(diff), ['день', 'дня', 'дней'])} раньше плана.`
      : 'Дом сдан точно в срок по договору.')

  function selectRelative(direction: 1 | -1) {
    setActiveIndex((current) => (current + direction + builtObjects.length) % builtObjects.length)
  }

  return (
    <Section id="objects">
      <div className="panel panel--dark overflow-hidden">
        <div className="mb-8 grid gap-6 lg:mb-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.55fr)] lg:items-end">
          <div>
            <p className="caption mb-4" data-reveal>
              <span aria-hidden className="size-1.5 rounded-full bg-[#8fa493]" />
              Сданные объекты
            </p>
            <h2 className="max-w-3xl text-white" data-reveal>
              Что получилось
              <span className="block text-white/45">на самом деле</span>
            </h2>
          </div>

          <div className="lg:pb-1">
            <p
              className="max-w-xl text-[15px] leading-[1.6] text-white/62"
              data-reveal
              style={{ '--reveal-delay': '100ms' } as React.CSSProperties}
            >
              Сравниваем стройку и готовый дом в одном кадре. Показываем цену из договора,
              план и фактический срок — включая задержки.
            </p>
            <div className="mt-5 flex items-center justify-between gap-4 lg:justify-start">
              <span className="font-heading text-[14px] tabular-nums text-white/55">
                {String(activeIndex + 1).padStart(2, '0')} / {String(builtObjects.length).padStart(2, '0')}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => selectRelative(-1)}
                  aria-label="Предыдущий объект"
                  className="icon-btn border-white/15 bg-white/8 text-white hover:bg-white hover:text-ink"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => selectRelative(1)}
                  aria-label="Следующий объект"
                  className="icon-btn border-white/15 bg-white/8 text-white hover:bg-white hover:text-ink"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          role="tabpanel"
          id="object-showcase"
          aria-labelledby={`object-tab-${object.slug}`}
          className="grid gap-3 xl:grid-cols-[minmax(0,1.38fr)_minmax(340px,0.62fr)]"
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-black/20 sm:aspect-[16/10] xl:aspect-auto xl:min-h-[620px]">
            <div className="grid h-full grid-cols-2 gap-px bg-white/20">
              <figure className="relative overflow-hidden bg-dark-soft">
                <Image
                  src={object.photoBefore}
                  alt={object.photoBeforeAlt}
                  fill
                  sizes="(min-width: 1280px) 36vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out hover:scale-[1.025]"
                />
                <figcaption className="absolute top-3 left-3 rounded-full bg-[#1e2521]/88 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-sm md:top-5 md:left-5">
                  Стройка
                </figcaption>
              </figure>

              <figure className="relative overflow-hidden bg-dark-soft">
                <Image
                  src={object.photoAfter}
                  alt={object.photoAfterAlt}
                  fill
                  sizes="(min-width: 1280px) 36vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out hover:scale-[1.025]"
                />
                <figcaption className="absolute top-3 right-3 rounded-full bg-white/92 px-3 py-1.5 text-[12px] font-medium text-ink backdrop-blur-sm md:top-5 md:right-5">
                  Сдан
                </figcaption>
              </figure>
            </div>

            <span
              aria-hidden
              className="absolute top-1/2 left-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-dark bg-white font-heading text-[15px] text-ink shadow-float md:size-12"
            >
              ↔
            </span>
          </div>

          <article className="flex flex-col rounded-[22px] bg-[#f4f3f0] p-5 text-ink sm:p-7 xl:p-8" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span
                className={cn(
                  'inline-flex min-h-8 items-center rounded-full px-3 text-[12px] font-medium',
                  delayed ? 'bg-[#f1e3dc] text-[#7b402f]' : 'bg-brand-tint text-brand-deep',
                )}
              >
                {statusLabel}
              </span>
              <span className="text-[13px] text-ink-soft">{object.year}</span>
            </div>

            <h3 className="mt-6 font-heading text-[clamp(1.75rem,1.3rem+1.5vw,2.65rem)] leading-[1.04] tracking-[-0.035em]">
              {object.name}
            </h3>
            <p className="mt-2 text-[14px] text-ink-soft">{object.location}</p>

            <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
              <div className="bg-white p-4">
                <dt className="text-[12px] text-ink-soft">Площадь</dt>
                <dd className="mt-1 font-heading text-[18px] font-medium tabular-nums">{object.area} м²</dd>
              </div>
              <div className="bg-white p-4">
                <dt className="text-[12px] text-ink-soft">Комплектация</dt>
                <dd className="mt-1 font-heading text-[18px] font-medium">{object.completeness}</dd>
              </div>
              <div className="col-span-2 bg-white p-4">
                <dt className="text-[12px] text-ink-soft">Цена по договору</dt>
                <dd className="mt-1 font-heading text-[22px] font-medium tabular-nums">{formatPrice(object.price)}</dd>
              </div>
            </dl>

            <div className="mt-7">
              <div className="flex items-baseline justify-between gap-4 text-[13px]">
                <span className="text-ink-soft">План — {object.plannedDays} дней</span>
                <span className={cn('font-medium', delayed ? 'text-[#7b402f]' : 'text-brand-deep')}>
                  Факт — {object.actualDays}
                </span>
              </div>
              <div className="mt-2.5 flex h-2 gap-px overflow-hidden rounded-full bg-[#deddd8]">
                <span className="h-full rounded-full bg-brand" style={{ width: `${plannedShare}%` }} />
                {delayShare > 0 ? (
                  <span className="h-full rounded-full bg-[#9a5b46]" style={{ width: `${delayShare}%` }} />
                ) : null}
              </div>
              <p className="mt-3 text-[13px] leading-[1.55] text-ink-soft">
                {scheduleNote}
              </p>
            </div>

            <blockquote className="mt-7 rounded-xl border border-line bg-white p-5 xl:mt-auto">
              <p className="text-[14px] leading-[1.65]">«{object.quote}»</p>
              <footer className="mt-3 text-[12px] text-ink-soft">{object.author}</footer>
            </blockquote>
          </article>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-stretch">
          <div
            role="tablist"
            aria-label="Выбрать построенный объект"
            className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {builtObjects.map((item, index) => {
              const selected = index === activeIndex
              const itemDiff = item.actualDays - item.plannedDays

              return (
                <button
                  key={item.slug}
                  id={`object-tab-${item.slug}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="object-showcase"
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    'flex min-w-[230px] flex-1 items-center gap-3 rounded-xl border p-2 text-left transition-colors duration-200',
                    selected
                      ? 'border-white bg-white text-ink'
                      : 'border-white/12 bg-white/6 text-white hover:bg-white/11',
                  )}
                >
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-dark-soft">
                    <Image src={item.photoAfter} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-heading text-[14px] font-medium">{item.name}</span>
                    <span className={cn('mt-1 block text-[12px]', selected ? 'text-ink-soft' : 'text-white/50')}>
                      {item.area} м² · {itemDiff > 0 ? `+${itemDiff} дней` : 'в срок'}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          <Button href="/objects" variant="light" arrow className="min-h-full lg:px-8">
            Все объекты
          </Button>
        </div>
      </div>
    </Section>
  )
}
