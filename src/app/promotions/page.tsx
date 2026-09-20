import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { PromotionsContent } from '@/components/promotions/PromotionsContent'

export const metadata: Metadata = {
  title: 'Акции на строительство дома',
  description: 'Семейная ипотека 6%, доставка домокомплекта и адаптация планировки в подарок. Предложения и условия при заказе строительства дома в Деревяге.',
  alternates: { canonical: '/promotions' },
}

export default function PromotionsPage() {
  return (
    <>
      <PageHero crumbs={[{ label: 'Акции' }]} title={<>Акции{' '}<span className="block text-ink-soft">для вашего дома</span></>}/>
      <PromotionsContent/>
    </>
  )
}
