'use client'

import { useEffect, useRef } from 'react'
import styles from './FinalCta.module.css'

export function BackgroundVideo({ className }: { className: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let visible = false
    const sync = () => {
      if (motion.matches || !visible || document.hidden) {
        video.pause()
      } else {
        if (!video.getAttribute('src')) {
          video.src = window.matchMedia('(max-width: 900px)').matches
            ? '/video/callback-construction-v2-mobile.mp4'
            : '/video/callback-construction-v2.mp4'
          video.load()
        }
        void video.play().catch(() => {})
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sync()
    }, { threshold: 0.05 })
    observer.observe(video)
    motion.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    return () => {
      observer.disconnect()
      motion.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
      video.pause()
    }
  }, [])

  return <video ref={videoRef} className={className} poster="/video/callback-construction-v2.webp"
    aria-hidden="true" muted loop playsInline preload="none" tabIndex={-1} />
}

export function CallbackVideo() {
  return <div className={styles.backdrop} aria-hidden="true"><BackgroundVideo className={styles.video} /></div>
}
