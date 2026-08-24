import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FinalCta } from '@/components/home/FinalCta'
import { HeaderInline } from '@/components/layout/HeaderInline'
import { Breadcrumbs } from '@/components/ui/Primitives'
import { Section } from '@/components/ui/Section'
import { blogPosts, formatBlogDate, type BlogBlock } from '@/content/blog'
import { pluralized } from '@/lib/utils'
import { siteUrl } from '@/lib/site-url'

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts.find((item) => item.slug === slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: 'article', publishedTime: post.date, images: [{ url: post.cover }] },
  }
}

/** Блоки статьи → разметка. Стили заданы здесь, а не глобально: прозы больше нигде нет */
function ArticleBlock({ block }: { block: BlogBlock }) {
  if (block.type === 'h2') {
    return <h2 className="mt-10 text-[clamp(1.25rem,1.1rem+0.6vw,1.6rem)]">{block.text}</h2>
  }
  if (block.type === 'ul') {
    return (
      <ul className="mt-5 space-y-3 text-[16px] leading-[1.65]">
        {block.items.map((item) => (
          <li key={item} className="flex gap-3.5">
            <span aria-hidden className="mt-[0.72em] size-1.5 shrink-0 rounded-full bg-brand" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    )
  }
  if (block.type === 'note') {
    return (
      <aside className="mt-8 rounded-xl bg-panel p-6 text-[15px] leading-[1.65] md:p-7">
        <p className="caption mb-2">От редакции</p>
        {block.text}
      </aside>
    )
  }
  return <p className="mt-5 text-[16px] leading-[1.75]">{block.text}</p>
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = blogPosts.find((item) => item.slug === slug)
  if (!post) notFound()

  const others = blogPosts.filter((item) => item.slug !== post.slug).slice(0, 2)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    image: `${siteUrl}${post.cover}`,
    author: { '@type': 'Organization', name: 'Деревяга' },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="pt-1">
        <div className="shell">
          <div className="panel panel--sheen pt-6">
            <HeaderInline />

            <div className="mx-auto max-w-3xl pb-2 pt-6 md:pt-10">
              <Breadcrumbs
                items={[
                  { href: '/', label: 'Главная' },
                  { href: '/blog', label: 'Блог' },
                  { label: post.title },
                ]}
              />
              <p className="caption mt-4">
                {formatBlogDate(post.date)} · {pluralized(post.readMinutes, ['минута', 'минуты', 'минут'])} чтения
              </p>
              <h1 className="mt-4 text-pretty" data-reveal>
                {post.title}
              </h1>
              <p className="lead mt-5" data-reveal style={{ '--reveal-delay': '90ms' } as React.CSSProperties}>
                {post.excerpt}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Section compact>
        <article className="mx-auto max-w-3xl">
          <figure className="overflow-hidden rounded-xl">
            <Image
              src={post.cover}
              alt={post.coverAlt}
              width={1400}
              height={900}
              priority
              sizes="(min-width: 1024px) 768px, 100vw"
              className="aspect-[16/9] w-full object-cover"
            />
          </figure>

          <div className="pt-4">
            {post.body.map((block, index) => (
              <ArticleBlock key={index} block={block} />
            ))}
          </div>
        </article>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl border-t border-line pt-10">
          <p className="caption mb-5">Читать дальше</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {others.map((other) => (
              <li key={other.slug}>
                <Link href={`/blog/${other.slug}`} className="card hover-lift block h-full rounded-xl p-6">
                  <p className="caption">{formatBlogDate(other.date)}</p>
                  <h3 className="mt-3 text-[17px]">{other.title}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <FinalCta
        formType="blog-article"
        title="Проверьте прочитанное на нашей смете"
        lead={
          <>
            Пришлём смету и шаблон договора — <strong>проверьте нас по чек-листам
            из статей</strong>. Если найдёте, к чему придраться, нам же лучше: исправим.
          </>
        }
      />
    </>
  )
}