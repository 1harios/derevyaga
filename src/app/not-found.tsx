import type { Metadata } from 'next'
import { HeaderInline } from '@/components/layout/HeaderInline'
import { Button } from '@/components/ui/Button'
import { company } from '@/content/company'
import { telHref } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Страница не найдена',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <section className="pt-1">
      <div className="shell">
        <div className="panel panel--sheen flex min-h-[70svh] flex-col pt-6">
          <HeaderInline />

          <div className="my-auto max-w-xl py-16">
            <p className="caption">Ошибка 404</p>
            <h1 className="mt-4">Такой страницы нет</h1>
            <p className="lead mt-5">
              Возможно, ссылка устарела или в адресе опечатка. Ничего страшного:
              всё важное — в каталоге проектов, а если ищете что-то конкретное,
              просто позвоните.
            </p>

            <div className="mt-8 flex flex-wrap gap-2.5">
              <Button href="/projects" arrow>
                Смотреть проекты
              </Button>
              <Button href="/" variant="outline">
                На главную
              </Button>
              <Button href={telHref(company.phone)} variant="outline">
                {company.phone}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
