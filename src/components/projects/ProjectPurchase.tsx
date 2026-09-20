import Image from 'next/image'
import { Button } from '@/components/ui/Button'

export function ProjectPurchase() {
  return <div id="purchase" className="grid scroll-mt-24 gap-3 lg:grid-cols-[1.35fr_1fr]">
    <article className="relative isolate flex min-h-[540px] flex-col justify-between overflow-hidden rounded-2xl p-7 text-white sm:p-10 lg:row-span-2">
      <Image src="/photos/project-purchase-interior.webp" alt="Светлая гостиная загородного дома с видом на сосновый лес — интерьерная иллюстрация" fill sizes="(min-width: 1024px) 55vw, 100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
      <div><p className="text-xs uppercase tracking-[.2em] text-white/75">Ближе к своему дому</p><h2 className="mt-6 !text-white">Семейная ипотека</h2><p className="mt-4 text-[100px] leading-none tracking-tighter sm:text-[130px]">6<span className="text-5xl">%</span></p></div>
      <div><p className="mb-6 max-w-xs text-sm leading-relaxed text-white/85">Ваш дом начинается с решения. Посмотрите условия программы на строительство.</p><Button href="/promotions#family-mortgage" variant="light" arrow>Условия ипотеки</Button></div>
    </article>
    <article className="relative overflow-hidden rounded-2xl bg-[#edf0e9] p-7 sm:p-9">
      <div className="flex items-center gap-3"><span aria-hidden className="h-px w-8 bg-brand" /><p className="text-xs uppercase tracking-[.15em] text-brand">Особые условия</p></div>
      <p className="my-5 text-[clamp(76px,8vw,112px)] leading-none tracking-[-.06em] text-brand">−10<span className="ml-1 text-[.55em]">%</span></p>
      <h3 className="text-2xl leading-tight">Дом выгоднее<br /><span className="text-ink-soft">при оплате наличными</span></h3>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">Скидка на всю стоимость дома по договору. Действует исключительно при наличном расчёте.</p>
      <div className="mt-6 border-t border-brand/15 pt-5"><Button href="/promotions#cash-discount" variant="dark" arrow>Условия скидки</Button></div>
    </article>
    <article className="rounded-2xl bg-dark p-7 text-white sm:p-9"><p className="text-xs uppercase tracking-[.15em] text-white/60">Индивидуальный подход</p><h3 className="mt-5 text-2xl !text-white">Ваши пожелания.<br />Точный расчёт.</h3><p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">Обсудим участок и детали дома. Соберём подробную смету с понятным составом работ.</p><Button href="#final-form" variant="outline-light" arrow className="mt-6">Получить смету</Button></article>
  </div>
}
