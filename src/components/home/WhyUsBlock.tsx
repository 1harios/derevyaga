import Image from 'next/image'
import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { cn } from '@/lib/utils'

/**
 * «Почему выбирают нас» — по референсу заказчика: четыре высокие фотоплитки
 * с предметной съёмкой на всю карточку, заголовком в верхней трети (первая
 * строка тёмная, продолжение приглушённое) и пилюлей «Подробнее» внизу.
 * Карточка сметы — тёмная, это акцент на главном обещании компании.
 * Каждая плитка ведёт на страницу с подробностями.
 *
 * ЗАМЕНИТЬ: снимки why-*.webp сгенерированы (Nano Banana Pro) как временные —
 * на боевом сайте их стоит заменить предметной съёмкой в той же манере:
 * объект в нижних двух третях квадратного кадра, светло-бежевый фон #f2f1ef
 * (у сметы — тёмный #1e2521), мягкий студийный свет, верхняя треть чистая.
 */
const reasons = [
  {
    title: 'Своя бригада',
    subtitle: 'и свой инструмент',
    href: '/about',
    photo: '/photos/why-brigada.webp',
    alt: 'Плотник в каске собирает конёк каркасной крыши из светлого бруса',
  },
  {
    title: 'Фиксированная смета',
    subtitle: 'в договоре',
    href: '/prices',
    photo: '/photos/why-smeta.webp',
    alt: 'Листы сметы с карандашом и складным метром на тёмном столе',
    dark: true,
  },
  {
    title: 'Брус камерной сушки',
    subtitle: 'влажность до 18%',
    href: '/technology',
    photo: '/photos/why-brus.webp',
    alt: 'Стопка строганого бруса с влагомером сверху',
  },
  {
    title: 'Стройка онлайн',
    subtitle: 'в личном кабинете',
    href: '/lk',
    photo: '/photos/why-kabinet.webp',
    alt: 'Смартфон с фотоотчётом стройки каркасного дома в личном кабинете',
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
              className="group relative isolate block min-h-[230px] overflow-hidden rounded-xl sm:min-h-[400px] xl:min-h-[430px]"
            >
              {/* Фото занимает всю плитку; верхняя треть кадра — чистый фон под текст */}
              <Image
                src={reason.photo}
                alt={reason.alt}
                width={880}
                height={880}
                sizes="(min-width: 1280px) 25vw, 45vw"
                className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
              />

              <div className="p-4 sm:p-6">
                <h3 className={cn('text-[15px] leading-snug sm:text-[18px]', reason.dark && 'text-white')}>
                  {reason.title}
                  <span className={cn('block font-normal', reason.dark ? 'text-white/60' : 'text-ink-soft')}>
                    {reason.subtitle}
                  </span>
                </h3>
              </div>

              {/* Пилюля «Подробнее» — как белые пилюли на фото первого экрана */}
              <span className="btn btn--light btn--sm absolute bottom-3 left-3 sm:bottom-5 sm:left-5">
                Подробнее
                <svg viewBox="0 0 14 14" aria-hidden className="icon-arrow size-3.5">
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
