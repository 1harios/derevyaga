import { Button } from '@/components/ui/Button'
import { PromotionGallery } from '@/components/promotions/PromotionGallery'
import styles from '@/components/promotions/Promotions.module.css'

export function PromotionsBlock() {
  return (
    <section id="promotions" className={styles.section}>
      <div className="shell">
        <div className={styles.heading}>
          <div>
            <h2>Акции{' '}<span className="block text-ink-soft">для вашего дома</span></h2>
          </div>
          <Button href="/promotions" variant="outline" arrow>Все акции</Button>
        </div>
        <PromotionGallery limit={3}/>
      </div>
    </section>
  )
}
