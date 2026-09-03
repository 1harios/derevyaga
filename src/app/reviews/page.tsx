import type { Metadata } from 'next'
import Image from 'next/image'
import { FinalCta } from '@/components/home/FinalCta'
import { PageHero } from '@/components/layout/PageHero'
import { Section, SectionHeader } from '@/components/ui/Section'
import { mapsRating, reviews, videoReviews } from '@/content/reviews'

export const metadata: Metadata = {
  title: 'Отзывы о строительстве — с контактами владельцев',
  description: `Отзывы о каркасных домах «Деревяга»: рейтинг ${mapsRating.value} на ${mapsRating.source}, видеоотзывы и тексты с согласием на публикацию. Публикуем и четвёрки — с описанием проблемы и решения.`,
  alternates: { canonical: '/reviews' },
}

/** Правила, по которым здесь появляются отзывы — иначе им нельзя верить */
const rules = [
  {
    title: 'Только реальные заказчики',
    text: 'Каждый отзыв привязан к договору и объекту. Имя, посёлок и год стройки согласованы с автором.',
  },
  {
    title: 'Публикуем и четвёрки',
    text: 'Отзыв с описанием проблемы и того, как её решили, полезнее десяти восторженных. Задержки и переделки не вырезаем.',
  },
  {
    title: 'С владельцами можно поговорить',
    text: 'Часть заказчиков согласилась отвечать на вопросы будущих клиентов. Контакты даём на встрече — не публикуем номера в открытом доступе.',
  },
]

export default function ReviewsPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Отзывы' }]}
        title="Что говорят те, кто уже построил"
        lead={
          <>
            Отзывы — слабое доказательство, если их нельзя проверить. Поэтому каждый
            текст здесь привязан к реальному объекту, а <strong>с частью владельцев
            можно поговорить лично</strong> — контакты даём на встрече.
          </>
        }
      >
        <a
          href={mapsRating.href}
          target="_blank"
          rel="noopener noreferrer"
          className="card inline-flex items-center gap-4 rounded-full py-3 pl-5 pr-6 hover-lift"
        >
          <span className="num text-[28px]">{mapsRating.value}</span>
          <span className="text-[13px] leading-tight muted">
            {mapsRating.count} отзыва
            <br />
            на {mapsRating.source}
          </span>
        </a>
      </PageHero>

      <Section>
        <div className="grid gap-3 lg:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.id} className="card flex flex-col rounded-xl p-5 md:p-6">
              <div className="flex items-center gap-4">
                <Image
                  src={review.photo}
                  alt={review.photoAlt}
                  width={480}
                  height={480}
                  sizes="56px"
                  className="size-14 shrink-0 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-[16px]">{review.author}</h3>
                  <p className="mt-0.5 text-[13px] muted">{review.meta}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-1" aria-label={`Оценка ${review.rating} из 5`}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    aria-hidden
                    className={`size-2 rounded-full ${index < review.rating ? 'bg-dark' : 'bg-line'}`}
                  />
                ))}
              </div>

              <p className="mt-4 text-[15px] leading-[1.6] muted">{review.text}</p>
            </article>
          ))}
        </div>

        {/* ЗАМЕНИТЬ: сюда добавляются остальные отзывы с согласием на публикацию */}
      </Section>

      <Section>
        <SectionHeader
          title="Видеоотзывы с объектов"
          description="Снимаем через несколько месяцев после сдачи, когда дом пережил сезон — так честнее, чем в день вручения ключей."
        />
        <div className="grid gap-3 md:grid-cols-2">
          {videoReviews.map((video) => (
            <a
              key={video.id}
              href={video.href}
              className="group relative block overflow-hidden rounded-xl"
              aria-label={`Смотреть видеоотзыв: ${video.title}`}
            >
              <Image
                src={video.poster}
                alt=""
                width={1200}
                height={800}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="aspect-[16/10] w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]"
              />
              <span aria-hidden className="absolute inset-0 bg-dark/35" />
              <span className="absolute inset-0 flex flex-col justify-between p-5 text-white">
                <span className="flex items-center justify-between">
                  <span className="chip chip--glass">{video.duration}</span>
                  <span className="icon-btn size-12">▶</span>
                </span>
                <span className="font-heading text-[17px] font-medium">{video.title}</span>
              </span>
            </a>
          ))}
        </div>
      </Section>

      <Section>
        <div className="panel">
          <div className="mb-7 max-w-2xl">
            <h2>Как отзывы попадают на эту страницу</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {rules.map((rule) => (
              <div key={rule.title} className="card rounded-xl p-6">
                <h3 className="text-[16px]">{rule.title}</h3>
                <p className="mt-2.5 text-[14px] leading-[1.6] muted">{rule.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <FinalCta
        formType="reviews"
        title="Дадим контакты владельцев вашего проекта"
        lead={
          <>
            Выбираете конкретный проект? Найдём владельцев таких же домов, которые
            согласились отвечать на вопросы, — <strong>спросите их про стройку напрямую</strong>,
            без нашего участия.
          </>
        }
      />
    </>
  )
}
