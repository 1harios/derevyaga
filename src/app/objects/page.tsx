import type { Metadata } from 'next'
import { FinalCta } from '@/components/home/FinalCta'
import { PageHero } from '@/components/layout/PageHero'
import { ObjectCard } from '@/components/ui/ObjectCard'
import { Section } from '@/components/ui/Section'
import { promises } from '@/content/company'
import { builtObjects } from '@/content/objects'
import { plural } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Построенные дома: план-факт сроков и отзывы владельцев',
  description:
    'Сданные каркасные дома в Ленинградской области: фото со стройки и после сдачи, плановые и фактические сроки, стоимость из договора и слова владельцев. Показываем и задержки.',
  alternates: { canonical: '/objects' },
}

export default function ObjectsPage() {
  const onTime = builtObjects.filter((object) => object.actualDays <= object.plannedDays).length
  const delayed = builtObjects.length - onTime

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Объекты' }]}
        title="Что получилось на самом деле"
        lead={
          <>
            По каждому объекту — фото со стройки и после сдачи,{' '}
            <strong>плановый и фактический срок</strong>, цена из договора и слова владельца.
            Задержки не прячем: где сорвали срок — написано, почему и на сколько.
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <span className="chip bg-surface">{promises.objectsBuilt}+ домов с 2011 года</span>
          <span className="chip bg-surface">
            {onTime} из {builtObjects.length} на этой странице — в срок или раньше
          </span>
          {delayed > 0 ? (
            <span className="chip bg-surface">
              {delayed} {plural(delayed, ['задержка', 'задержки', 'задержек'])} — с причиной и без доплат
            </span>
          ) : null}
        </div>
      </PageHero>

      <Section>
        <ul className="grid gap-3 lg:grid-cols-2">
          {builtObjects.map((object) => (
            <li key={object.slug}>
              <ObjectCard object={object} />
            </li>
          ))}
        </ul>

        {/* ЗАМЕНИТЬ: сюда добавляются остальные сданные объекты по мере сбора
            материалов — фото «до/после», сроки и согласие владельца */}
        <div className="card mt-3 rounded-xl p-6 text-center md:p-8">
          <p className="mx-auto max-w-2xl text-[15px] leading-[1.65] muted">
            Здесь три объекта, по которым собраны все материалы: фото этапов, сроки
            и согласие владельцев на публикацию и звонки. Остальные {promises.objectsBuilt - builtObjects.length}+
            домов показываем на встрече — с адресами и контактами владельцев, которые
            согласились отвечать на вопросы.
          </p>
        </div>
      </Section>

      <FinalCta
        formType="objects"
        title="Съездим на строящийся объект вместе"
        lead={
          <>
            Лучший способ проверить подрядчика — <strong>посмотреть стройку своими глазами</strong>.
            Покажем каркас до зашивки, познакомим с прорабом и дадим контакты владельцев
            сданных домов.
          </>
        }
      />
    </>
  )
}
