'use client'

import { useSyncExternalStore, type MouseEvent } from 'react'
import Image from 'next/image'
import { LuCheck } from 'react-icons/lu'
import { ArrowIcon } from '@/components/ui/Button'
import { LeadForm } from '@/components/ui/LeadForm'
import { Modal } from '@/components/ui/Modal'
import { promotions, type PromotionId } from '@/content/promotions'
import styles from './Promotions.module.css'

type Promotion = (typeof promotions)[number]

function subscribe(listener: () => void) {
  window.addEventListener('hashchange', listener)
  window.addEventListener('popstate', listener)
  return () => {
    window.removeEventListener('hashchange', listener)
    window.removeEventListener('popstate', listener)
  }
}

function snapshot() {
  return promotions.find((offer) => `#${offer.id}` === window.location.hash)?.id ?? ''
}

function notifyHash() { window.dispatchEvent(new Event('hashchange')) }

function PromotionArtwork({ offer, inModal = false }: { offer: Promotion; inModal?: boolean }) {
  return (
    <span className={styles.artwork}>
      <Image src={offer.image} alt={offer.alt} fill quality={90} sizes={inModal ? '(max-width: 700px) 100vw, 500px' : '(max-width: 639px) 100vw, (max-width: 1199px) 50vw, 25vw'} className={styles.photo}/>
    </span>
  )
}

export function PromotionGallery({ limit }: { limit?: number } = {}) {
  const selected = useSyncExternalStore(subscribe, snapshot, () => '')
  const offer = promotions.find((item) => item.id === selected)

  function open(event: MouseEvent<HTMLAnchorElement>, id: PromotionId) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    event.preventDefault()
    event.currentTarget.focus({ preventScroll: true })
    window.history.pushState({ ...window.history.state, promotionDialog: true }, '', `#${id}`)
    notifyHash()
  }

  function close() {
    if (window.history.state?.promotionDialog) {
      window.history.back()
    } else {
      // A direct link has no modal-only history entry to go back to.
      window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search)
      notifyHash()
    }
  }

  return (
    <>
      <ul className={`${styles.grid} ${limit === 3 ? styles.homeGrid : ''}`} aria-label="Акции на строительство дома">
        {promotions.slice(0, limit).map((item) => (
          <li key={item.id} className={styles.tile}>
            <a href={`#${item.id}`} onClick={(event) => open(event, item.id)} className={styles.card} aria-haspopup="dialog" aria-label={`Подробнее: ${item.title}`}>
              <PromotionArtwork offer={item}/>
              <span className={styles.overlay} aria-hidden="true">
                <span className={styles.overlayTitle}>{item.title}</span>
                <span className={styles.description}>{item.shortDescription}</span>
                <span className={`btn btn--light btn--sm ${styles.more}`}>Подробнее<span className="btn__arrow"><ArrowIcon/></span></span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <Modal open={Boolean(offer)} onClose={close} title={offer?.title ?? 'Условия акции'} size="wide">
        {offer && (
          <div className={styles.modalGrid} key={offer.id}>
            <div className={styles.modalInfo}>
              <div className={styles.modalArtwork}><PromotionArtwork offer={offer} inModal/></div>
              <p className={styles.intro}>{offer.description}</p>
              <ul className={styles.conditions}>
                {offer.conditions.map((condition) => <li key={condition}><LuCheck aria-hidden/><span>{condition}</span></li>)}
              </ul>
              {offer.id === 'family-mortgage' && <a className={styles.bankLink} href="https://domrfbank.ru/mortgage/programs/family-mortgage/" target="_blank" rel="noopener noreferrer">Условия программы на сайте Банка ДОМ.РФ ↗</a>}
            </div>
            <div className={styles.form}>
              <span className={styles.formLabel}>Ваш следующий шаг</span>
              <h4>{offer.action}</h4>
              <p>Оставьте телефон. Расскажем об условиях и рассчитаем стоимость вашего дома.</p>
              <LeadForm formType={`promotion-${offer.id}`} submitLabel="Узнать условия акции" withName={false} successNote="Менеджер свяжется с вами и расскажет об условиях выбранной акции."/>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
