import { PromotionGallery } from './PromotionGallery'
import styles from './Promotions.module.css'

export function PromotionsContent() {
  return <div className={`shell ${styles.pageGallery}`}><PromotionGallery/></div>
}
