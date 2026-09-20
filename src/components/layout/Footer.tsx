import Image from 'next/image'
import Link from 'next/link'
import { LuMail, LuMapPin, LuPhone, LuPlus } from 'react-icons/lu'
import { FooterCallback } from './FooterCallback'
import { company, legalLinks } from '@/content/company'
import { footerColumns } from '@/content/nav'
import { telHref } from '@/lib/utils'
import { SocialLinks } from './SocialLinks'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="shell">
        <div className={styles.panel}>
          <div className={styles.top}>
            <div className={styles.brand}>
              <Link href="/" aria-label="Деревяга — на главную" className={styles.logo}>
                <Image src="/brand/derevyaga-full-linen.svg" alt="Деревяга, каркасные дома" width={827} height={992} className={styles.logoImage}/>
              </Link>
              <div className={styles.brandCopy}><p className={styles.tagline}>Дом начинается<br/>с хорошей команды.</p><p className={styles.region}>Каркасные дома в Санкт-Петербурге<br className={styles.desktopBreak}/> и Ленинградской области.</p></div>
            </div>
            <div className={styles.contact}>
              <a href={telHref(company.phone)} className={styles.phone}><LuPhone aria-hidden/>{company.phone}</a>
              <span className={styles.hours}>{company.workHours}</span>
              <FooterCallback className={styles.callback}/>
            </div>
          </div>
          <div className={styles.navigation}>
            <Image src="/brand/derevyaga-mark-linen.svg" alt="" aria-hidden width={605} height={684} className={styles.watermark}/>
            {footerColumns.map(column => (
              <nav key={column.title} aria-label={column.title}>
                <h3>{column.title}</h3>
                <ul>{column.items.map(item => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}</ul>
              </nav>
            ))}
          </div>
          <div className={styles.connections}>
            <div className={styles.addresses}>
              <a href={`mailto:${company.email}`}><LuMail aria-hidden/><span>{company.email}</span></a>
              <a href={company.mapUrl} target="_blank" rel="noopener noreferrer"><LuMapPin aria-hidden/><span>Санкт-Петербург, ул. Разъезжая, 44</span></a>
            </div>
            <div className={styles.social}><SocialLinks/></div>
          </div>
          <div className={styles.bottom}>
            <details className={styles.details}>
              <summary>Реквизиты компании <LuPlus aria-hidden/></summary>
              <div><p>{company.legal.fullName}</p><p>ИНН {company.legal.inn} · КПП {company.legal.kpp}</p><p>{company.legal.legalAddress}</p><p className={styles.disclaimer}>Цены на сайте не являются публичной офертой. Точная стоимость фиксируется в договоре после выезда замерщика.</p></div>
            </details>
            <ul className={styles.legal}><li><Link href="/legal/privacy">Политика конфиденциальности</Link></li>{legalLinks.slice(1).map(item=><li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}</ul>
            <span className={styles.copyright}>© {new Date().getFullYear()} {company.name}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
