import { LuPhone, LuUserRound } from 'react-icons/lu'
import { HeaderInline } from '@/components/layout/HeaderInline'
import { Button } from '@/components/ui/Button'
import { CountUp } from '@/components/ui/CountUp'
import { company, cta } from '@/content/company'
import { telHref } from '@/lib/utils'
import { BackgroundVideo } from './CallbackVideo'
import styles from './Hero.module.css'

const heroStats = [
  { value: 94, prefix: '~', suffix: '', label: 'дня средний срок стройки' },
  { value: 5, prefix: '', suffix: '+', label: 'лет гарантии на конструктив' },
  { value: 218, prefix: '', suffix: '+', label: 'домов сдано с 2011 года' },
]

export function Hero() {
  return (
    <section className={styles.section} aria-labelledby="hero-title">
      <div className="shell">
        <div className={styles.hero}>
          <div className={styles.media} aria-hidden="true">
            <BackgroundVideo className={styles.video} />
            <div className={styles.shade} />
          </div>
          <div className={styles.header}>
            <HeaderInline onDark />
            <div className={styles.contacts}>
              <Button href="/calculator" variant="light" size="sm" arrow className={styles.calculatorButton}>Калькулятор стоимости</Button>
              <a href={telHref(company.phone)} className={`btn btn--light btn--sm ${styles.phone}`} aria-label={`Позвонить: ${company.phone}`}><LuPhone aria-hidden /><span>{company.phone}</span></a>
              <a href="/lk" className={`btn btn--light btn--sm btn--icon ${styles.account}`} aria-label="Личный кабинет"><LuUserRound aria-hidden /></a>
            </div>
          </div>
          <div className={styles.copy}>
            <h1 id="hero-title">Строительство<br />каркасных домов</h1>
            <p className={styles.region}>Строим для жизни в Петербурге и Ленинградской области</p>
            <p className={styles.description}>Поможем выбрать проект под ваш участок и образ жизни.{' '}<br />Заранее согласуем комплектацию, стоимость и сроки строительства.</p>
            <div className={styles.actions}>
              <Button href="#final-form" variant="light" arrow>{cta.primary}</Button>
              <Button href="/projects" variant="outline-light">{cta.secondary}</Button>
            </div>
          </div>
          <div className={styles.stats}>
            {heroStats.map((stat, index) => (
              <div key={stat.label} className={styles.stat}>
                <div className={styles.number}>
                  {stat.prefix && <span className={styles.numberSign}>{stat.prefix}</span>}
                  <CountUp value={stat.value} duration={1400 + index * 250} />
                  {stat.suffix && <span className={styles.numberSign}>{stat.suffix}</span>}
                </div>
                <p>{stat.value === 218 ? <>домов сдано<br />с 2011 года</> : stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
