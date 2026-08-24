import Image from 'next/image'
import Link from 'next/link'
import { Section } from '@/components/ui/Section'

/**
 * «Почему выбирают нас» — четыре плитки с вырезанными изображениями без фона
 * (холст 690×880, верхние ~180 px прозрачные — это место под заголовок).
 * Плитка ровного цвета #f0efed, при наведении перекрашивается в зелёный
 * #436453, текст переходит в белый, а круглая кнопка-стрелка внизу
 * раскрывается в «Подробнее». Вырезка прижата к низу плитки и центрирована:
 * на широких планшетных плитках по бокам остаётся ровный фон.
 *
 * ЗАМЕНИТЬ: вырезки why2-*.webp собраны как временные — на боевом сайте
 * заменить предметной съёмкой реальных объектов в той же манере
 * (объект без фона на прозрачном холсте 690×880, верх пустой).
 */
const reasons = [
  {
    title: 'Своя бригада',
    subtitle: 'и свой инструмент',
    href: '/about',
    photo: '/photos/why2-brigada.webp',
    alt: 'Монтажник в каске крепит обрешётку крыши шуруповёртом',
  },
  {
    title: 'Более 200',
    subtitle: 'довольных клиентов',
    href: '/reviews',
    photo: '/photos/why2-otzyvy.webp',
    alt: 'Отзывы клиентов о строительстве с оценками пять звёзд',
  },
  {
    title: 'Разработаем',
    subtitle: 'индивидуальный проект',
    href: '/projects',
    photo: '/photos/why2-proekt.webp',
    alt: 'Фасад каркасного дома с панорамными окнами и тёмной кровлей',
  },
  {
    title: 'Стройка онлайн',
    subtitle: 'в личном кабинете',
    href: '/lk',
    photo: '/photos/why2-kabinet.webp',
    alt: 'Смартфон с фотоотчётами и этапами стройки в личном кабинете',
  },
]

export function WhyUsBlock() {
  return (
    <Section id="why-us">
      {/* Заголовок по референсу: первая строка тёмная, продолжение приглушённое,
          ниже — мелкая подпись с фактом */}
      <div className="mb-7 max-w-2xl md:mb-9">
        <h2 className="text-pretty" data-reveal>
          Быстрые сроки{' '}
          <span className="block text-ink-soft">и качество, зафиксированное в договоре</span>
        </h2>
        <p
          className="mt-3 text-[14px] muted"
          data-reveal
          style={{ '--reveal-delay': '110ms' } as React.CSSProperties}
        >
          Каркас не даёт усадки — заселиться можно сразу после сдачи.
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
        {reasons.map((reason, index) => (
          <li key={reason.title} data-reveal style={{ '--reveal-delay': `${index * 90}ms` } as React.CSSProperties}>
            <Link
              href={reason.href}
              className="group relative isolate block min-h-[230px] overflow-hidden rounded-xl bg-[#f0efed] transition-colors duration-300 hover:bg-[#436453] sm:min-h-[400px] xl:min-h-[430px]"
            >
              {/* Вырезка без фона: прижата к низу и центрирована, высота — по плитке */}
              <Image
                src={reason.photo}
                alt={reason.alt}
                width={690}
                height={880}
                className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[82%] w-auto max-w-none -translate-x-1/2 object-contain object-bottom transition-transform duration-300 ease-out group-hover:scale-[1.02] sm:h-full"
              />

              <div className="p-3.5 sm:p-6">
                <h3 className="font-sans text-[13px] font-medium leading-[1.3] text-[#1b211d] transition-colors duration-300 group-hover:text-white sm:text-[18px]">
                  {reason.title}
                  <span className="block font-normal text-[#6a6a6a] transition-colors duration-300 group-hover:text-white/75">
                    {reason.subtitle}
                  </span>
                </h3>
              </div>

              {/* Круглая кнопка-стрелка; при наведении раскрывается слово «Подробнее» */}
              <span className="absolute bottom-3 left-3 inline-flex h-9 items-center overflow-hidden rounded-full bg-white px-[11px] text-[13px] font-medium text-[#1b211d] shadow-[0_1px_4px_rgba(30,37,33,0.10)] transition-all duration-300 sm:bottom-5 sm:left-5 sm:h-10 sm:px-[13px] sm:text-[14px]">
                <span className="max-w-0 -translate-x-1 whitespace-nowrap opacity-0 transition-all duration-300 group-hover:mr-1.5 group-hover:max-w-[110px] group-hover:translate-x-0 group-hover:opacity-100">
                  Подробнее
                </span>
                <svg viewBox="0 0 14 14" aria-hidden className="icon-arrow size-3.5 shrink-0">
                  <path
                    d="M3 3h8v8M11 3 3 11"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}
