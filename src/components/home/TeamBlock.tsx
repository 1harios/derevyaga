import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Section, SectionHeader } from '@/components/ui/Section'
import { company } from '@/content/company'

export function TeamBlock() {
  return (
    <Section id="about">
      <SectionHeader
        eyebrow="Бригада и компания"
        title="Строим сами, а не передаём подряд"
        description={
          <>
            Каркас, кровлю и фасад делают <strong>штатные бригады</strong>. Инструмент свой,
            а не арендованный по объекту — от этого зависят <strong>и качество, и срок</strong>.
          </>
        }
      />

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <figure className="card overflow-hidden rounded-xl p-2">
          <Image
            src="/photos/brigada.webp"
            alt="Бригада укладывает утеплитель в каркас стены"
            width={1400}
            height={933}
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="w-full rounded-lg object-cover"
          />
          <figcaption className="px-3 py-4 text-[14px] muted">
            Постоянный состав: четыре бригады по 4–5 человек, у каждой свой прораб.
          </figcaption>
        </figure>

        <div className="stack">
          <figure className="card overflow-hidden rounded-xl p-2">
            <Image
              src="/photos/park-instrumenta.webp"
              alt="Парк инструмента компании: пилы, нивелир, пневмопистолеты"
              width={1200}
              height={800}
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="w-full rounded-lg object-cover"
            />
            <figcaption className="px-3 py-4 text-[14px] muted">
              Свой парк инструмента и прицеп-мастерская на каждом объекте.
            </figcaption>
          </figure>

          <div className="card rounded-xl p-5 md:p-6">
            <h3 className="text-[17px]">Юридическая сторона</h3>
            <dl className="mt-4 space-y-2 text-[15px]">
              <div className="flex justify-between gap-4">
                <dt className="muted">Компания</dt>
                <dd className="text-right">{company.legal.fullName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="muted">ИНН</dt>
                <dd className="tabular-nums">{company.legal.inn}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="muted">ОГРН</dt>
                <dd className="tabular-nums">{company.legal.ogrn}</dd>
              </div>
            </dl>
            <p className="mt-4 text-[14px] leading-[1.55] muted">
              Договор подряда, смета приложением, акты по этапам. Все платежи — на расчётный счёт
              компании.
            </p>
            <div className="mt-5">
              <Button href="/about" variant="outline" wide arrow>
                О компании подробно
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
