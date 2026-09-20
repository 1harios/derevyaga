import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import styles from './ConstructorBanner.module.css'

export function ConstructorBanner() {
  return <section id="home-constructor" className="py-8 md:py-10" aria-labelledby="home-constructor-title">
    <div className="shell">
      <div className={styles.panel} data-reveal>
        <div className={styles.copy}>
          <h2 id="home-constructor-title">Соберите<br />дом под себя</h2>
          <p>Выберите размер, материалы и террасу.<br className={styles.desktopBreak} /> Узнайте предварительную стоимость.</p>
          <Button href="/calculator#constructor" variant="light" arrow className={styles.cta}>Открыть конструктор</Button>
        </div>
        <div className={styles.visual}>
          <Image src="/photos/constructor-configurator-user-v7.png" alt="Серый макет каркасного дома с вариантами утепления, кровли, фасада и фундамента" width={1536} height={1024} sizes="(min-width: 1800px) 1000px, (min-width: 901px) 61vw, 100vw" />
        </div>
      </div>
    </div>
  </section>
}
