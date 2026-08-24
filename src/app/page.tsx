import { BuildStepsBlock } from '@/components/home/BuildStepsBlock'
import { CabinetBlock } from '@/components/home/CabinetBlock'
import { FaqBlock } from '@/components/home/FaqBlock'
import { FinalCta } from '@/components/home/FinalCta'
import { Hero } from '@/components/home/Hero'
import { WhyUsBlock } from '@/components/home/WhyUsBlock'
import { ObjectsSlider } from '@/components/home/ObjectsSlider'
import { ProjectsPreview } from '@/components/home/ProjectsPreview'
import { ReviewsBlock } from '@/components/home/ReviewsBlock'
import { TeamBlock } from '@/components/home/TeamBlock'
import { TechnologyBlock } from '@/components/home/TechnologyBlock'
import { company } from '@/content/company'
import { faqItems } from '@/content/faq'
import { mapsRating } from '@/content/reviews'
import { siteUrl } from '@/lib/site-url'

/** Микроразметка: организация с адресом и часами плюс блок вопросов */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'LocalBusiness',
      '@id': `${siteUrl}#organization`,
      name: company.name,
      description:
        'Строительство каркасных домов под ключ в Санкт-Петербурге и Ленинградской области',
      url: siteUrl,
      telephone: company.phone,
      email: company.email,
      address: {
        '@type': 'PostalAddress',
        addressLocality: company.city,
        addressCountry: 'RU',
        streetAddress: company.address,
      },
      openingHours: 'Mo-Sa 09:00-20:00',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: mapsRating.value,
        reviewCount: mapsRating.count,
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
  ],
}

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero />
      <WhyUsBlock />
      <TechnologyBlock />
      <ProjectsPreview />
      <BuildStepsBlock />
      <CabinetBlock />
      <ObjectsSlider />
      <ReviewsBlock />
      <TeamBlock />
      <FaqBlock />
      <FinalCta />
    </>
  )
}