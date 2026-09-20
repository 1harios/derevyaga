import { FeaturedHomeCard } from '@/components/home/FeaturedHomeCard'
import type { Project } from '@/content/projects'

/** Единая карточка проекта для каталога, калькулятора и страниц городов. */
export function ProjectCard({ project, priority }: { project: Project; priority?: boolean }) {
  return <FeaturedHomeCard project={project} priority={priority} />
}
