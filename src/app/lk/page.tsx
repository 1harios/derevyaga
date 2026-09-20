import type { Metadata } from 'next'
import { Cabinet } from '@/components/cabinet/Cabinet'
import { PageHero } from '@/components/layout/PageHero'
import { cabinetMode } from '@/lib/cabinet/store'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Личный кабинет заказчика',
  description:
    'Этапы строительства вашего дома, фотографии, видеоотчёты и переписка с командой.',
  alternates: { canonical: '/lk' },
  robots: { index: false, follow: true },
}

export default function CabinetPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Личный кабинет' }]}
        title={<>Ваш дом.<br/><span className="muted">Всё под контролем.</span></>}
        lead={
          <>
            Следите за <strong>этапами строительства</strong>, смотрите фото и видео с участка
            и оставайтесь <strong>на связи с командой</strong>.
          </>
        }
      />
      <Cabinet demo={cabinetMode() === 'demo'}/>
    </>
  )
}
