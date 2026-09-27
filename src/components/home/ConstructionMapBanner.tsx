import { Button } from '@/components/ui/Button'
import { Section, SectionHeader } from '@/components/ui/Section'
import { ConstructionMap } from '@/components/construction/ConstructionMap'
import type { Project } from '@/content/projects'
import { getConstructionObjects } from '@/lib/amocrm-construction'
import { linkedProjects } from '@/lib/construction-objects'

export async function ConstructionMapBanner({ projects }: { projects: Project[] }) {
  const result = await getConstructionObjects()
  return <Section id="construction-map">
    <SectionHeader title={<>Дома, которые<span className="block text-ink-soft">мы строим для жизни</span></>}
      description="Готовые дома и стройки, которые идут прямо сейчас. Нажмите на отметку — внутри фотографии, выполненные работы и стоимость."
      action={<Button href="/construction-map" variant="outline" arrow>Все объекты на карте</Button>} />
    <ConstructionMap objects={result.objects} projects={linkedProjects(result.objects, projects)} unavailable={result.state === 'error'} />
  </Section>
}
