import React, { useState, useRef, useEffect } from 'react'
import { testimonialsData } from '../../data/data.js'
import { useInView } from '../../hooks/useInView'
import { Volume2, VolumeX } from 'lucide-react'
import styles from './Testimonials.module.css'

export function Testimonials() {
  const [ref, inView] = useInView()
  const [active, setActive] = useState(0)
  const [mutedStates, setMutedStates] = useState(
    testimonialsData.testimonials.map(() => true)
  )
  const videoRefs = useRef([])
  const startX = useRef(0)
  const total = testimonialsData.testimonials.length

  // Pause all videos except active
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return
      if (i === active) {
        video.play().catch(() => {})
      } else {
        video.pause()
        video.currentTime = 0
      }
    })
  }, [active])

  const toggleMute = (e, idx) => {
    e.stopPropagation()
    const newMuted = [...mutedStates]
    newMuted[idx] = !newMuted[idx]
    setMutedStates(newMuted)
    if (videoRefs.current[idx]) {
      videoRefs.current[idx].muted = newMuted[idx]
    }
  }

  const handleDragStart = (e) => {
    startX.current = e.touches ? e.touches[0].clientX : e.clientX
  }

  const handleDragEnd = (e) => {
    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX
    const diff = startX.current - endX
    if (diff > 40) setActive((prev) => Math.min(prev + 1, total - 1))
    if (diff < -40) setActive((prev) => Math.max(prev - 1, 0))
  }

  return (
    <section
      id="testimonials"
      className={`${styles.section} ${inView ? styles.visible : ''}`}
      ref={ref}
    >
      <div className={styles.container}>
        <span className={styles.badge}>{testimonialsData.badge}</span>
        <h2 className={styles.heading}>{testimonialsData.heading}</h2>

        <div
          className={styles.carousel}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
        >
          <div
            className={styles.track}
            style={{ transform: `translateX(calc(-${active * 100}% - ${active * 16}px))` }}
          >
            {testimonialsData.testimonials.map((t, i) => (
              <div key={t.id} className={styles.card}>
                <div className={styles.videoArea}>
                  {t.videoUrl ? (
                    <>
                      <video
                        ref={el => videoRefs.current[i] = el}
                        src={t.videoUrl}
                        className={styles.video}
                        autoPlay={i === 0}
                        muted={mutedStates[i]}
                        loop
                        playsInline
                        onContextMenu={e => e.preventDefault()}
                      />
                      {/* Mute/Unmute button */}
                      <button
                        className={styles.muteBtn}
                        onClick={(e) => toggleMute(e, i)}
                        aria-label={mutedStates[i] ? 'Unmute' : 'Mute'}
                      >
                        {mutedStates[i]
                          ? <VolumeX size={16} />
                          : <Volume2 size={16} />
                        }
                      </button>
                    </>
                  ) : (
                    <div className={styles.placeholder} />
                  )}
                </div>
                <div className={styles.info}>
                  <span className={styles.name}>{t.name}</span>
                  <span className={styles.role}>{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className={styles.dots}>
          {testimonialsData.testimonials.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default React.memo(Testimonials)
