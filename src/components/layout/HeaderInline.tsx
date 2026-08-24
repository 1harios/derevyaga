import Image from 'next/image'
import Link from 'next/link'
import { MobileNav } from '@/components/layout/MobileNav'
import { headerNav } from '@/content/nav'

/**
 * Шапка внутри панели первого экрана — одна линия: знак, имя, подпись
 * и ссылки меню выровнены по одной оси высотой с пилюли на фото справа,
 * поэтому вся шапка читается единой строкой через оба блока.
 *
 * Плавающая шапка при прокрутке — отдельный компонент StickyHeader.
 */
export function HeaderInline() {
  return (
    <div className="flex min-h-11 items-center justify-between gap-6 md:justify-start md:gap-7 xl:gap-10">
      <Link
        href="/"
        aria-label="Деревяга — на главную"
        className="shrink-0 transition-opacity duration-200 ease-out hover:opacity-80"
      >
        <Image
          src="/brand/logo-derevyaga.webp"
          alt="Деревяга"
          width={836}
          height={306}
          priority
          className="h-9 w-auto"
        />
      </Link>

      {/* На мобильном ссылки не помещаются — там кнопка меню */}
      <MobileNav className="md:hidden" size="sm" />

      <nav aria-label="Основное меню" className="hidden md:block">
        <ul className="flex items-center gap-5 xl:gap-8">
          {headerNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="nav-link whitespace-nowrap text-[14px] muted hover:text-ink"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
