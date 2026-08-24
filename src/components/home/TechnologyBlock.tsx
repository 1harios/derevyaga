import Image from 'next/image'

/**
 * Блок «Строим дома по каркасной технологии». Пропорции сняты с референса:
 * текстовая колонка слева, фотография каркаса под текстом уходит вниз
 * под панель каталога, колонка тёмных карточек справа.
 *
 * Карточки по референс-мокапу заказчика: широкая белая плитка слева
 * с предметным фото образца, справа крупный заголовок и текст — без иконок.
 */
/** ЗАМЕНИТЬ: параметры узлов — из стандарта компании */
const advantages = [
  {
    title: 'Высокая прочность',
    text: 'Узлы собраны на стальном крепеже с раскосами — каркас не подвержен образованию трещин и деформации.',
    photo: '/photos/tech-uzel.webp',
    alt: 'Образец углового узла каркаса: стойка, балка и раскос на стальном крепеже',
  },
  {
    title: 'Теплоизоляция',
    text: '200 мм утеплителя и ветрозащитная мембрана: дом быстро отапливается и долго сохраняет тепло.',
    photo: '/photos/tech-uteplenie.webp',
    alt: 'Образец стены в разрезе: стойки, минеральный утеплитель, мембрана и обшивка',
  },
  {
    title: 'Отсутствие усадки',
    text: 'Брус камерной сушки не ведёт со временем — заселяться в коттедж можно сразу после отделки.',
    photo: '/photos/tech-bez-usadki.webp',
    alt: 'Стопка сухого строганого бруса с влагомером',
  },
]

export function TechnologyBlock() {
  return (
    <section id="technology" className="overflow-x-clip pt-10 md:pt-14">
      <div className="shell">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
          <div>
            <h2 className="max-w-md" data-reveal>
              Строим дома
              <br />
              по каркасной технологии
            </h2>
            {/* Колонка текста шире, а перенос «pretty»: без висячих последних слов */}
            <p className="lead mt-4 max-w-xl text-pretty" data-reveal style={{ '--reveal-delay': '90ms' } as React.CSSProperties}>
              Коттеджи и бани, построенные по <strong>каркасной технологии</strong>, получили
              широкое распространение во всём мире — некоторые служат людям{' '}
              <strong>уже много веков</strong>.
            </p>

            {/* Каркас в низком ракурсе по референсу. Левый край выровнен
                по контенту, стойки продолжаются до нижнего края кадра
                и уходят под плашку каталога — без белого зазора */}
            <Image
              src="/photos/karkas-doma.webp"
              alt="Каркас дома из строганой доски в низком ракурсе: стропильная система, конёк и стойки"
              width={2585}
              height={1477}
              sizes="(min-width: 1024px) 48vw, 100vw"
              data-reveal="zoom"
              className="pointer-events-none mt-6 -mb-10 w-full max-w-none lg:mt-8 lg:-mb-[5rem] lg:w-[88%]"
            />
          </div>

          {/* Колонка карточек центрируется по высоте секции, правый край
              карточек совпадает с краями фото и панели каталога */}
          <ul className="flex flex-col gap-3 lg:-translate-y-1 lg:self-stretch lg:justify-center">
            {advantages.map((item, index) => (
              <li
                key={item.title}
                data-reveal="right"
                style={{ '--reveal-delay': `${index * 110}ms` } as React.CSSProperties}
                className="card--dark hover-lift group flex items-center gap-4 p-3.5 md:p-4"
              >
                {/* Белая плитка с предметным фото образца — по мокапу:
                    небольшое скругление, картинка прижата к нижнему правому углу */}
                <span className="min-h-[128px] w-[104px] shrink-0 self-stretch overflow-hidden rounded-[10px] bg-white pl-1.5 pt-1.5 md:min-h-[140px] md:w-[112px]">
                  <Image
                    src={item.photo}
                    alt={item.alt}
                    width={800}
                    height={800}
                    sizes="112px"
                    className="h-full w-full object-contain object-right-bottom transition-transform duration-300 ease-out group-hover:scale-[1.05]"
                  />
                </span>
                <div className="min-w-0 py-1 pr-1">
                  <h3 className="text-[16px]">{item.title}</h3>
                  <p className="muted mt-1.5 max-w-[300px] text-[13px] leading-[1.55]">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
