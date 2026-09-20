import type { ReactNode } from 'react'
import Image from 'next/image'
import { LuPhone } from 'react-icons/lu'
import { LeadForm } from '@/components/ui/LeadForm'
import { Section } from '@/components/ui/Section'
import { SocialLinks } from '@/components/layout/SocialLinks'
import { company } from '@/content/company'
import { telHref } from '@/lib/utils'
import styles from './FinalCta.module.css'
import { CallbackVideo } from './CallbackVideo'

/** Shared callback form; preserve each page's CRM attribution. */
export function FinalCta({ formType = 'final-cta', title, lead, projectSlug, area }: {
  formType?: string; title?: ReactNode; lead?: ReactNode; projectSlug?: string; area?: number
} = {}) {
  return (
    <Section id="final-form">
      <div className={styles.card}>
        <CallbackVideo />
        <div className={styles.story}>
          <div className={styles.intro}>
            <h2>{title ?? <>Ваш дом<br/>начинается<span>с разговора.</span></>}</h2>
            <p>{lead ?? <>Расскажите о вашем будущем доме.<br/>Поможем выбрать проект и материалы,<br className={styles.desktopBreak}/> рассчитаем стоимость строительства.</>}</p>
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.formHeader}><Image src="/brand/derevyaga-mark-moss.png" alt="Деревяга" width={36} height={42} className="h-10 w-9 shrink-0 object-contain"/><span>Давайте познакомимся</span></div>
          <h3>Оставьте номер,<br/>мы перезвоним</h3>
          <p className={styles.hint}>Обсудим ваши пожелания и подскажем,<br/>с чего начать строительство.</p>
          <div className={styles.form}>
            <LeadForm formType={formType} submitLabel="Заказать звонок" withName={false} projectSlug={projectSlug} area={area} successNote="Спасибо! Мы получили ваш номер и перезвоним в течение рабочего дня."/>
          </div>
          <div className={styles.contact}><span>Или позвоните нам</span><a href={telHref(company.phone)}><LuPhone aria-hidden/>{company.phone}</a><small>{company.workHours}</small></div>
        </div>
        <div className={styles.social}>
          <div><h3>Давайте оставаться на связи</h3><p>Проекты, детали строительства и ответы на вопросы.</p></div>
          <SocialLinks/>
        </div>
      </div>
    </Section>
  )
}
