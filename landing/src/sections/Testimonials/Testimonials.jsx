import { useState, useRef, useCallback, memo } from 'react'
import { testimonialsData } from '../../data/data.js'
import { useInView } from '../../hooks/useInView'
import styles from './Testimonials.module.css'

// ── VideoCard OUTSIDE — never remounts ──────────────
const VideoCard = memo(({ t }) => {
  return (
    <div className={styles.card}>
      <div className={styles.videoArea}>
        <iframe
          src={t.videoUrl}
          className={styles.video}
          allow="autoplay"
          allowFullScreen
          style={{ border: 'none' }}
        />
      </div>
    </div>
  )
})

VideoCard.displayName = 'VideoCard'

// ── Main Component ───────────────────────────────────
export default function Testimonials() {
  const [sectionRef, inView] = useInView()
  const [activeSlide, setActiveSlide] = useState(0)
  const startX = useRef(0)
  const total = testimonialsData.testimonials.length

  const handleTouchStart = useCallback((e) => {
    startX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((e) => {
    const diff = startX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) < 50) return
    if (diff > 0 && activeSlide < total - 1) {
      setActiveSlide(prev => prev + 1)
    } else if (diff < 0 && activeSlide > 0) {
      setActiveSlide(prev => prev - 1)
    }
  }, [activeSlide, total])

  return (
    <section
      id="testimonials"
      className={`${styles.section} ${inView ? styles.visible : ''}`}
      ref={sectionRef}
    >
      <div className={styles.container}>
        <span className={styles.badge}>{testimonialsData.badge}</span>
        <h2 className={styles.heading}>{testimonialsData.heading}</h2>

        {/* Desktop — 4 grid */}
        <div className={styles.desktopGrid}>
          {testimonialsData.testimonials.map((t) => (
            <VideoCard key={`desktop-${t.id}`} t={t} />
          ))}
        </div>

        {/* Mobile — carousel */}
        <div className={styles.mobileCarousel}>
          <div
            className={styles.mobileTrack}
            style={{ transform: `translateX(calc(-${activeSlide * 100}% - ${activeSlide * 12}px))` }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {testimonialsData.testimonials.map((t) => (
              <div key={`mobile-${t.id}`} className={styles.mobileSlide}>
                <VideoCard key={`mobile-${t.id}`} t={t} />
              </div>
            ))}
          </div>

          <div className={styles.dots}>
            {testimonialsData.testimonials.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === activeSlide ? styles.dotActive : ''}`}
                onClick={() => {
                  setActiveSlide(i)
                }}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
