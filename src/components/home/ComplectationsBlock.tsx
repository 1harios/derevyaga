import { ComplectationColumns } from '@/components/ui/ComparisonTable'
import { Section, SectionHeader } from '@/components/ui/Section'
import { neverIncluded } from '@/content/complectations'

export function ComplectationsBlock() {
  return (
    <Section id="complectations">
      <SectionHeader
        align="center"
        eyebrow="Из чего складывается цена"
        title="Три комплектации, состав до последнего винта"
        description="Разница между ними — в объёме работ, а не в качестве. Конструктив, утепление и узлы одинаковые во всех трёх."
      />

      <ComplectationColumns />

      <div className="card mt-3 rounded-xl p-6 md:p-7">
        <h3 className="text-[17px]">Что не входит ни в одну комплектацию</h3>
        <ul className="mt-4 grid gap-2.5 text-[15px] leading-[1.55] muted sm:grid-cols-2">
          {neverIncluded.map((item) => (
            <li key={item} className="flex gap-3">
              <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-line" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[14px] muted">
          Эти работы можем организовать через проверенных подрядчиков — стоимость считается
          отдельно и в фиксированную смету дома не входит.
        </p>
      </div>
    </Section>
  )
}
