import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/Primitives'
import { Section } from '@/components/ui/Section'
import { StatusBadge } from '@/components/ui/Tag'
import { formatPrice } from '@/lib/utils'

const mockStages = [
  { name: 'Договор и проект', status: 'done' as const, dates: '12.03 — 16.03' },
  { name: 'Фундамент', status: 'done' as const, dates: '18.03 — 21.03' },
  { name: 'Каркас и перекрытия', status: 'in-progress' as const, dates: '22.03 — 09.04' },
  { name: 'Кровля', status: 'waiting' as const, dates: 'с 10.04' },
]

const mockPhotos = [
  '/photos/detal-uzel.webp',
  '/photos/detal-uteplenie.webp',
  '/photos/obekt-ladoga-karkas.webp',
  '/photos/brigada.webp',
]

export function CabinetBlock() {
  return (
    <Section id="cabinet">
      <div className="panel panel--dark on-dark">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-12">
          <div>
            <h2>Видно, что происходит на вашей стройке</h2>
            <p className="lead mt-5">
              Не отчёты «когда попросите», а <strong>постоянный доступ</strong> к статусам,
              фотографиям, документам и платежам. Доступ выдаём{' '}
              <strong>в день подписания договора</strong>.
            </p>

            <ul className="mt-8 space-y-5 border-t border-white/12 pt-8">
              {[
                {
                  title: 'Фотоотчёты каждые 7 дней',
                  text: 'И обязательно перед зашивкой скрытых работ. Скачиваются одним архивом.',
                },
                {
                  title: 'Статусы этапов с план-фактом',
                  text: 'Плановая и фактическая дата рядом. Задержан этап — видна причина, а не молчание.',
                },
                {
                  title: 'График платежей и документы',
                  text: 'Договор, приложения, акты и чеки в одном месте, без поиска в переписке.',
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-white/70" />
                  <div>
                    <h3 className="text-[16px]">{item.title}</h3>
                    <p className="muted mt-1.5 text-[14px] leading-[1.55]">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-2.5">
              <Button href="/lk" variant="light" arrow>
                Как это работает
              </Button>
              <Button href="/lk" variant="outline-light">
                Войти в кабинет
              </Button>
            </div>
          </div>

          {/* Не скриншот, а живая разметка: чётче на любом экране и легче по весу */}
          <div className="overflow-hidden rounded-xl bg-canvas text-ink">
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
              <div>
                <div className="text-[13px] text-ink-soft">Объект</div>
                <div className="font-heading text-[16px] font-medium">
                  Ладога 132 · Всеволожский район
                </div>
              </div>
              <StatusBadge status="in-progress" />
            </div>

            <div className="border-b border-line px-5 py-5">
              <ProgressBar value={41} label="Готовность объекта" />
            </div>

            <div className="grid gap-px bg-line sm:grid-cols-2">
              <div className="bg-canvas px-5 py-5">
                <div className="mb-3 text-[13px] text-ink-soft">Этапы</div>
                <ul className="space-y-3">
                  {mockStages.map((stage) => (
                    <li key={stage.name} className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[14px] leading-tight">{stage.name}</div>
                        <div className="text-[13px] text-ink-soft">{stage.dates}</div>
                      </div>
                      <StatusBadge status={stage.status} />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-canvas px-5 py-5">
                <div className="mb-3 text-[13px] text-ink-soft">Следующий платёж</div>
                <div className="num text-[24px]">{formatPrice(1_128_000)}</div>
                <p className="mt-2 text-[13px] leading-[1.45] text-ink-soft">
                  20% — после приёмки каркаса. Ориентировочно 09.04, точная дата появится после акта.
                </p>

                <div className="mb-3 mt-6 text-[13px] text-ink-soft">Последние фото</div>
                <div className="grid grid-cols-4 gap-2">
                  {mockPhotos.map((photo, index) => (
                    <Image
                      key={photo}
                      src={photo}
                      alt={`Фотоотчёт со стройки, снимок ${index + 1}`}
                      width={200}
                      height={200}
                      sizes="80px"
                      className="aspect-square w-full rounded-sm object-cover"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-4">
              <span className="text-[13px] text-ink-soft">Прораб Андрей ответил 14 минут назад</span>
              <span className="btn btn--outline btn--sm">Написать менеджеру</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
