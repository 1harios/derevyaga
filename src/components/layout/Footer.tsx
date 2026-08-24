import Image from 'next/image'
import Link from 'next/link'
import { company, legalLinks } from '@/content/company'
import { footerColumns } from '@/content/nav'
import { telHref } from '@/lib/utils'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="pb-3 pt-8 md:pb-4">
      <div className="shell">
        <div className="panel panel--dark on-dark">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,320px)_1fr]">
            <div>
              <Image
                src="/brand/logo-full-linen.webp"
                alt="Деревяга, каркасные дома"
                width={560}
                height={816}
                className="h-[104px] w-auto"
              />
              <p className="mt-6 max-w-xs text-[15px] leading-[1.6] muted">
                Каркасные дома под ключ в {company.cityPrepositional} и Ленинградской области.
                Своя бригада, фиксированная цена в договоре.
              </p>

              <div className="mt-6 space-y-1">
                <a href={telHref(company.phone)} className="font-heading text-[22px] font-medium tabular-nums">
                  {company.phone}
                </a>
                <p className="text-[14px] muted">{company.workHours}</p>
                <a href={`mailto:${company.email}`} className="link-underline block text-[15px]">
                  {company.email}
                </a>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <a href={company.telegram} className="btn btn--outline-light btn--sm">
                  Telegram
                </a>
                <a href={company.whatsapp} className="btn btn--outline-light btn--sm">
                  WhatsApp
                </a>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
              {footerColumns.map((column) => (
                <nav key={column.title} aria-label={column.title}>
                  <h3 className="mb-4 text-[14px] font-normal muted">{column.title}</h3>
                  <ul className="space-y-2.5">
                    {column.items.map((item) => (
                      <li key={item.href}>
                        <Link href={item.href} className="text-[15px] text-white/90 hover:text-white">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          </div>

          <hr className="divider my-10" />

          <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
            <div className="space-y-1.5 text-[14px] leading-[1.6] muted">
              <p>{company.legal.fullName}</p>
              <p>
                ИНН {company.legal.inn} · ОГРН {company.legal.ogrn}
              </p>
              <p>{company.legal.legalAddress}</p>
              <p>Офис: {company.address}</p>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <span className="chip bg-white/10 text-white/80">
                <span aria-hidden className="size-1.5 rounded-full bg-white/70" />
                Данные обрабатываются на серверах в РФ
              </span>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[14px] muted lg:justify-end">
                {legalLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="link-underline">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-8 text-[13px] muted">
            © {year} {company.name}. Цены на сайте не являются публичной офертой: точная стоимость
            фиксируется в договоре после выезда замерщика.
          </p>
        </div>
      </div>
    </footer>
  )
}
