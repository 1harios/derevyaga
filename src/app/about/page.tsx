import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
export const metadata: Metadata = {
  title: 'О компании',
  description: 'Информация о компании «Деревяга» скоро появится на этой странице.',
  alternates: { canonical: '/about' },
  robots: { index: false, follow: true },
}
export default function AboutPage() {
  return <>
    <PageHero crumbs={[{ label: 'О компании' }]} title="О компании" lead="Готовим новую страницу. Скоро здесь расскажем о «Деревяге» и нашей команде." />
    <Section compact><div className="flex flex-wrap gap-3">
      <Button href="/projects" arrow>Посмотреть проекты</Button>
      <Button href="/contacts" variant="outline" arrow>Связаться с нами</Button>
    </div></Section>
  </>
}
