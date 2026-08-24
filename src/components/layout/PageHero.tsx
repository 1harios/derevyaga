import type { ReactNode } from 'react'
import { HeaderInline } from '@/components/layout/HeaderInline'
import { Breadcrumbs } from '@/components/ui/Primitives'

/**
 * Первый экран внутренних страниц. Та же светлая панель, что на главной,
 * и та же шапка внутри — сайт на любой странице начинается одинаково,
 * а плавающая пилюля появляется при прокрутке, как на главной.
 *
 * Ниже шапки — хлебные крошки, заголовок и подводка. В children страница
 * кладёт своё: чипы, цифры, фильтры, кнопки.
 */
export function PageHero({
  crumbs,
  title,
  lead,
  children,
}: {
  /** Без «Главной» — она подставляется сама */
  crumbs: { href?: string; label: string }[]
  title: ReactNode
  lead?: ReactNode
  children?: ReactNode
}) {
  return (
    <section className="pt-1">
      <div className="shell">
        <div className="panel panel--sheen pt-6">
          <HeaderInline />

          <div className="mt-6 md:mt-10">
            <Breadcrumbs items={[{ href: '/', label: 'Главная' }, ...crumbs]} />

            <div className="max-w-3xl pt-2">
              <h1 className="text-pretty" data-reveal>
                {title}
              </h1>
              {lead ? (
                <p
                  className="lead mt-5"
                  data-reveal
                  style={{ '--reveal-delay': '90ms' } as React.CSSProperties}
                >
                  {lead}
                </p>
              ) : null}
            </div>

            {children ? (
              <div
                className="mt-7"
                data-reveal
                style={{ '--reveal-delay': '170ms' } as React.CSSProperties}
              >
                {children}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
