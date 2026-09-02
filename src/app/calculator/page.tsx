import type { Metadata } from 'next'
import { HouseConstructor } from '@/components/constructor/HouseConstructor'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { promises } from '@/content/company'
import { constructorConfig } from '@/lib/constructor/config'

export const metadata: Metadata = {
  title: 'Конструктор дома: соберите и посчитайте каркасный дом',
  description:
    'Выбирайте размер 6×6–8×10, кровлю, отделку и террасу — дом собирается на экране, а цена со сборкой, свайным полем и доставкой от Янино считается сразу. Ипотека: семейная 6 % или обычная.',
  alternates: { canonical: '/calculator' },
}

const family = constructorConfig.mortgage.programs.find((item) => item.id === 'family')

/** Как устроен расчёт — честные ответы вместо «магии» */
const notes = [
  {
    title: 'Цены — из прайса производства',
    text: 'Конструктор считает по тому же прайсу, что и менеджер: дом со сборкой, свайное поле по количеству свай и доставка от Янино по километрам. Никаких скрытых «от», к которым потом прибавляют всё подряд.',
  },
  {
    title: `Под ключ за ${constructorConfig.buildDays} дней после договора`,
    text: 'Дом собираем на собственном производстве и монтируем на участке своими бригадами. Работаем без предоплаты, а также с семейной ипотекой и материнским капиталом.',
  },
  {
    title: 'Телефон — только чтобы сохранить расчёт',
    text: 'Весь конструктор работает без регистрации. Номер понадобится, если захотите получить расчёт и смету в PDF или подобрать ипотечную программу.',
  },
]

export default function CalculatorPage() {
  return (
    <>
      {/* Компактная шапка страницы: конструктор должен помещаться в один экран на десктопе */}
      <div className="shell pt-4 md:pt-5">
        <div className="flex flex-col gap-1.5 md:flex-row md:items-baseline md:justify-between md:gap-8">
          <h1 className="text-[clamp(1.35rem,1.1rem+0.9vw,1.75rem)] leading-tight">Соберите свой дом за две минуты</h1>
          <p className="max-w-[64ch] text-[14px] leading-snug text-ink-soft">
            Семь шагов — дом собирается на экране, а цена со сборкой, свайным полем и доставкой от{' '}
            {constructorConfig.deliveryOrigin.replace('посёлок ', 'п. ')} считается сразу.
            {family ? ` Семейная ипотека ${family.rate} %.` : ''}
          </p>
        </div>
      </div>

      {/* Конструктор рендерится на сервере целиком — без Suspense-заглушки и сдвига страницы */}
      <HouseConstructor />

      <Section compact>
        <h2 className="sr-only">Как устроен расчёт</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {notes.map((note) => (
            <div key={note.title} className="card rounded-xl p-6">
              <h3 className="text-[16px]">{note.title}</h3>
              <p className="mt-2.5 text-[14px] leading-[1.6] muted">{note.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-col items-start justify-between gap-5 rounded-xl bg-panel p-6 md:flex-row md:items-center md:p-7">
          <p className="max-w-2xl text-[15px] leading-[1.6]">
            Нужен дом больше или с другой планировкой? Посмотрите проекты под ключ от 78 м² —
            с фиксированной ценой и сроком в договоре.
          </p>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button href="/projects" variant="outline" arrow>
              Каталог проектов
            </Button>
            <Button href="/complectations" variant="outline">
              Состав комплектаций
            </Button>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-[13px] leading-[1.6] muted">
          Расчёт предварительный и не является публичной офертой. Точная стоимость фиксируется
          в договоре после бесплатного выезда замерщика — смета готова за {promises.estimateDays}{' '}
          рабочих дня.
        </p>
      </Section>
    </>
  )
}
