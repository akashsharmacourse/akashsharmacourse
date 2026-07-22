import { useState, useRef, useEffect } from 'react'
import { testimonialsData } from '../../data/data.js'
import { useInView } from '../../hooks/useInView'
import { Volume2, VolumeX, Play, Pause } from 'lucide-react'
import styles from './Testimonials.module.css'

export default function Testimonials() {
  const [ref, inView] = useInView()
  const [active, setActive] = useState(0)
  const [mutedStates, setMutedStates] = useState(
    testimonialsData.testimonials.map(() => true)
  )
  const [playingStates, setPlayingStates] = useState(
    testimonialsData.testimonials.map(() => false)
  )
  const [progressStates, setProgressStates] = useState(
    testimonialsData.testimonials.map(() => 0)
  )
  const videoRefs = useRef([])
  const startX = useRef(0)
  const total = testimonialsData.testimonials.length

  // Detect mobile
  const isMobile = () => window.innerWidth <= 768

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return
      if (i === active) {
        if (isMobile()) {
          // Mobile — autoplay muted
          video.muted = true
          video.play().catch(() => {})
          const newPlaying = [...playingStates]
          newPlaying[i] = true
          setPlayingStates(newPlaying)
        }
      } else {
        video.pause()
        video.currentTime = 0
        const newPlaying = [...playingStates]
        newPlaying[i] = false
        setPlayingStates(newPlaying)
      }
    })
  }, [active])

  const togglePlay = (e, idx) => {
    e.stopPropagation()
    const video = videoRefs.current[idx]
    if (!video) return
    if (video.paused) {
      video.play()
      const newPlaying = [...playingStates]
      newPlaying[idx] = true
      setPlayingStates(newPlaying)
    } else {
      video.pause()
      const newPlaying = [...playingStates]
      newPlaying[idx] = false
      setPlayingStates(newPlaying)
    }
  }

  const toggleMute = (e, idx) => {
    e.stopPropagation()
    const newMuted = [...mutedStates]
    newMuted[idx] = !newMuted[idx]
    setMutedStates(newMuted)
    if (videoRefs.current[idx]) {
      videoRefs.current[idx].muted = newMuted[idx]
    }
  }

  const handleTimeUpdate = (idx) => {
    const video = videoRefs.current[idx]
    if (!video || !video.duration) return
    const newProgress = [...progressStates]
    newProgress[idx] = (video.currentTime / video.duration) * 100
    setProgressStates(newProgress)
  }

  const handleSeek = (e, idx) => {
    e.stopPropagation()
    const bar = e.currentTarget
    const rect = bar.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const video = videoRefs.current[idx]
    if (video) video.currentTime = percent * video.duration
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
                        muted={mutedStates[i]}
                        loop
                        playsInline
                        preload="auto"
                        onTimeUpdate={() => handleTimeUpdate(i)}
                        onContextMenu={e => e.preventDefault()}
                      />

                      {/* Center play button — desktop only */}
                      <button
                        className={`${styles.centerPlayBtn} ${playingStates[i] ? styles.hidden : ''}`}
                        onClick={(e) => togglePlay(e, i)}
                        aria-label="Play"
                      >
                        <Play size={28} fill="white" color="white" />
                      </button>

                      {/* Bottom controls */}
                      <div className={styles.videoControls}>
                        {/* Progress bar */}
                        <div
                          className={styles.progressBar}
                          onClick={(e) => handleSeek(e, i)}
                        >
                          <div
                            className={styles.progressFill}
                            style={{ width: `${progressStates[i]}%` }}
                          />
                        </div>

                        {/* Buttons */}
                        <div className={styles.controlRow}>
                          <button
                            className={styles.controlBtn}
                            onClick={(e) => togglePlay(e, i)}
                          >
                            {playingStates[i]
                              ? <Pause size={14} fill="white" color="white" />
                              : <Play size={14} fill="white" color="white" />
                            }
                          </button>
                          <button
                            className={styles.controlBtn}
                            onClick={(e) => toggleMute(e, i)}
                          >
                            {mutedStates[i]
                              ? <VolumeX size={14} color="white" />
                              : <Volume2 size={14} color="white" />
                            }
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className={styles.placeholder} />
                  )}
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
