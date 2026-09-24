import { Button } from '@/components/ui/Button'
import { Section, SectionHeader } from '@/components/ui/Section'
import { ConstructionMap } from '@/components/construction/ConstructionMap'
import { getConstructionObjects } from '@/lib/amocrm-construction'

export async function ConstructionMapBanner() {
  const result = await getConstructionObjects()
  return <Section id="construction-map">
    <SectionHeader title={<>Дома, которые<span className="block text-ink-soft">мы строим для жизни</span></>} action={<Button href="/construction-map" variant="outline" arrow>Все объекты на карте</Button>} />
    <ConstructionMap objects={result.objects} unavailable={result.state === 'error'} />
  </Section>
}
