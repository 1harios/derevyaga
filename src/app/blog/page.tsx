import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { FinalCta } from '@/components/home/FinalCta'
import { PageHero } from '@/components/layout/PageHero'
import { Section } from '@/components/ui/Section'
import { blogPosts, formatBlogDate } from '@/content/blog'
import { pluralized } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Блог о каркасных домах — без рекламного тумана',
  description:
    'Как читать смету, что мороз делает со стройкой и как выбирают фундамент. Пишем то, что полезно даже тем, кто построит дом с другим подрядчиком.',
  alternates: { canonical: '/blog' },
}

export default function BlogPage() {
  const [first, ...rest] = blogPosts

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Блог' }]}
        title="Пишем то, что полезно до подписания"
        lead={
          <>
            Одно правило: статья должна помогать, <strong>даже если строить вы будете
            с другими</strong>. Как читать сметы, что проверять в договоре и как
            технология переживает петербургскую погоду.
          </>
        }
      />

      <Section>
        {/* Свежая статья — крупно, остальные — сеткой */}
        <Link
          href={`/blog/${first.slug}`}
          className="card hover-lift group grid overflow-hidden rounded-xl md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
        >
          <div className="overflow-hidden bg-white max-md:order-first md:order-last">
            <Image
              src={first.cover}
              alt={first.coverAlt}
              width={1200}
              height={800}
              sizes="(min-width: 768px) 45vw, 100vw"
              className="h-full max-h-[420px] w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            />
          </div>
          <div className="flex flex-col justify-between gap-8 p-6 md:p-9">
            <div>
              <p className="caption">
                {formatBlogDate(first.date)} · {pluralized(first.readMinutes, ['минута', 'минуты', 'минут'])}
              </p>
              <h2 className="mt-4 text-[clamp(1.4rem,1.15rem+1vw,2rem)]">{first.title}</h2>
              <p className="lead mt-4">{first.excerpt}</p>
            </div>
            <span className="btn btn--outline self-start">
              Читать
              <svg viewBox="0 0 14 14" aria-hidden className="icon-arrow size-3.5">
                <path d="M3 3h8v8M11 3 3 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
          </div>
        </Link>

        <ul className="mt-3 grid gap-3 md:grid-cols-2">
          {rest.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="card hover-lift group flex h-full flex-col overflow-hidden rounded-xl">
                <div className="overflow-hidden">
                  <Image
                    src={post.cover}
                    alt={post.coverAlt}
                    width={1200}
                    height={675}
                    sizes="(min-width: 768px) 45vw, 100vw"
                    className="aspect-[16/9] w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="caption">
                    {formatBlogDate(post.date)} · {pluralized(post.readMinutes, ['минута', 'минуты', 'минут'])}
                  </p>
                  <h3 className="mt-3 text-[19px]">{post.title}</h3>
                  <p className="mt-3 text-[14.5px] leading-[1.6] muted">{post.excerpt}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* ЗАМЕНИТЬ: по мере выхода статей список растёт; пока — три опорные */}
      </Section>

      <FinalCta
        formType="blog"
        title="Проверьте нашу смету по нашему же чек-листу"
        lead={
          <>
            В статьях мы рассказываем, как проверять подрядчиков. Логично начать с нас:
            пришлём смету и договор — <strong>сверьте каждую строку с чек-листом</strong>.
          </>
        }
      />
    </>
  )
}
