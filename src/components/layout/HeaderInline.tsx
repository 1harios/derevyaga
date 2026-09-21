import Image from 'next/image'
import Link from 'next/link'
import { LuUserRound } from 'react-icons/lu'
import { MobileNav } from '@/components/layout/MobileNav'
import { headerNav } from '@/content/nav'

/**
 * Шапка внутри панели первого экрана — одна линия: знак, имя, подпись
 * и ссылки меню выровнены по одной оси высотой с пилюли на фото справа,
 * поэтому вся шапка читается единой строкой через оба блока.
 *
 * Плавающая шапка при прокрутке — отдельный компонент StickyHeader.
 */
export function HeaderInline({ onDark = false }: { onDark?: boolean }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-6 md:justify-start md:gap-7 xl:gap-10">
      <Link
        href="/"
        aria-label="Деревяга — на главную"
        className="shrink-0 transition-opacity duration-200 ease-out hover:opacity-80"
      >
        <Image
          src="/brand/derevyaga-horizontal-green.svg"
          alt="Деревяга"
          width={840}
          height={300}
          priority
          className={`h-9 w-auto${onDark ? ' brightness-0 invert' : ''}`}
        />
      </Link>

      {/* На мобильном ссылки не помещаются — там кнопка меню */}
      <div className={`flex items-center gap-1 md:hidden ${onDark ? 'text-white' : 'text-[#1e2521]'}`}>
        <Link href="/lk" aria-label="Личный кабинет" className="inline-flex size-11 items-center justify-center transition-opacity hover:opacity-70"><LuUserRound className="size-5" aria-hidden /></Link>
        <MobileNav plain />
      </div>

      <nav aria-label="Основное меню" className="hidden md:block">
        <ul className="flex items-center gap-5 xl:gap-8">
          {headerNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`nav-link whitespace-nowrap text-[14px] ${onDark ? 'text-white hover:text-white/80' : 'muted hover:text-ink'}`}
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
