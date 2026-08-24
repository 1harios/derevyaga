import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Section, SectionHeader } from '@/components/ui/Section'
import { mapsRating, reviews, videoReviews } from '@/content/reviews'

export function ReviewsBlock() {
  return (
    <Section id="reviews">
      <SectionHeader
        eyebrow="Отзывы"
        title="Что говорят те, кто уже построил"
        description={
          <>
            Публикуем и четвёрки: отзыв с описанием проблемы и того, <strong>как её решили</strong>,
            полезнее десяти восторженных.
          </>
        }
        action={
          <a
            href={mapsRating.href}
            target="_blank"
            rel="noopener noreferrer"
            className="card flex items-center gap-4 rounded-full py-3 pl-5 pr-6"
          >
            <span className="num text-[28px]">{mapsRating.value}</span>
            <span className="text-[13px] leading-tight muted">
              {mapsRating.count} отзыва
              <br />
              на {mapsRating.source}
            </span>
          </a>
        }
      />

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

      <div className="mt-3 grid gap-3 md:grid-cols-2">
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

      <div className="mt-6">
        <Button href="/reviews" variant="outline" arrow>
          Все отзывы и контакты владельцев
        </Button>
      </div>
    </Section>
  )
}
