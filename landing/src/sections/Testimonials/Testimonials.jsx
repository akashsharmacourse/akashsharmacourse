import { useState, useRef } from 'react'
import { testimonialsData } from '../../data/data.js'
import { useInView } from '../../hooks/useInView'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import styles from './Testimonials.module.css'

export default function Testimonials() {
  const [ref, inView] = useInView()
  const [active, setActive] = useState(0)
  const [playingStates, setPlayingStates] = useState(
    testimonialsData.testimonials.map(() => false)
  )
  const [mutedStates, setMutedStates] = useState(
    testimonialsData.testimonials.map(() => true)
  )
  const [progressStates, setProgressStates] = useState(
    testimonialsData.testimonials.map(() => 0)
  )
  const videoRefs = useRef([])
  const startX = useRef(0)
  const total = testimonialsData.testimonials.length

  const handlePlay = (i) => {
    const video = videoRefs.current[i]
    if (!video) return
    if (video.paused) {
      videoRefs.current.forEach((v, idx) => {
        if (v && idx !== i) {
          v.pause()
          v.currentTime = 0
          const np = [...playingStates]
          np[idx] = false
          setPlayingStates([...np])
        }
      })
      video.muted = false
      video.play()
      const np = [...playingStates]
      np[i] = true
      setPlayingStates([...np])
      const nm = [...mutedStates]
      nm[i] = false
      setMutedStates([...nm])
    } else {
      video.pause()
      const np = [...playingStates]
      np[i] = false
      setPlayingStates([...np])
    }
  }

  const toggleMute = (e, i) => {
    e.stopPropagation()
    const video = videoRefs.current[i]
    if (!video) return
    video.muted = !mutedStates[i]
    const nm = [...mutedStates]
    nm[i] = !mutedStates[i]
    setMutedStates([...nm])
  }

  const handleTimeUpdate = (i) => {
    const video = videoRefs.current[i]
    if (!video || !video.duration) return
    const np = [...progressStates]
    np[i] = (video.currentTime / video.duration) * 100
    setProgressStates([...np])
  }

  const handleSeek = (e, i) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const video = videoRefs.current[i]
    if (video) video.currentTime = percent * video.duration
  }

  // Swipe handlers
  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    const diff = startX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) < 50) return
    if (diff > 0) {
      // Swipe left — next
      const next = Math.min(active + 1, total - 1)
      setActive(next)
      // Pause current
      if (videoRefs.current[active]) {
        videoRefs.current[active].pause()
        const np = [...playingStates]
        np[active] = false
        setPlayingStates([...np])
      }
    } else {
      // Swipe right — prev
      const prev = Math.max(active - 1, 0)
      setActive(prev)
      if (videoRefs.current[active]) {
        videoRefs.current[active].pause()
        const np = [...playingStates]
        np[active] = false
        setPlayingStates([...np])
      }
    }
  }

  const VideoCard = ({ t, i }) => (
    <div className={styles.card}>
      <div className={styles.videoArea}>
        <video
          ref={el => videoRefs.current[i] = el}
          className={styles.video}
          preload="metadata"
          loop
          playsInline
          muted={mutedStates[i]}
          onTimeUpdate={() => handleTimeUpdate(i)}
          onEnded={() => {
            const np = [...playingStates]
            np[i] = false
            setPlayingStates([...np])
          }}
          onContextMenu={e => e.preventDefault()}
        >
          <source src={t.videoUrl} type="video/mp4" />
        </video>
        {!playingStates[i] && (
          <button
            className={styles.centerPlay}
            onClick={() => handlePlay(i)}
          >
            <Play size={28} fill="white" color="white" />
          </button>
        )}
        <div className={styles.controls}>
          <div className={styles.progressBar} onClick={(e) => handleSeek(e, i)}>
            <div className={styles.progressFill} style={{ width: `${progressStates[i]}%` }} />
          </div>
          <div className={styles.controlRow}>
            <button className={styles.controlBtn} onClick={() => handlePlay(i)}>
              {playingStates[i]
                ? <Pause size={13} fill="white" color="white" />
                : <Play size={13} fill="white" color="white" />
              }
            </button>
            <button className={styles.controlBtn} onClick={(e) => toggleMute(e, i)}>
              {mutedStates[i]
                ? <VolumeX size={13} color="white" />
                : <Volume2 size={13} color="white" />
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <section
      id="testimonials"
      className={`${styles.section} ${inView ? styles.visible : ''}`}
      ref={ref}
    >
      <div className={styles.container}>
        <span className={styles.badge}>{testimonialsData.badge}</span>
        <h2 className={styles.heading}>{testimonialsData.heading}</h2>

        {/* Desktop — 4 grid */}
        <div className={styles.desktopGrid}>
          {testimonialsData.testimonials.map((t, i) => (
            <VideoCard key={t.id} t={t} i={i} />
          ))}
        </div>

        {/* Mobile — carousel */}
        <div className={styles.mobileCarousel}>
          <div
            className={styles.mobileTrack}
            style={{ transform: `translateX(calc(-${active * 100}% - ${active * 12}px))` }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {testimonialsData.testimonials.map((t, i) => (
              <div key={t.id} className={styles.mobileSlide}>
                <VideoCard t={t} i={i} />
              </div>
            ))}
          </div>

          {/* Dots — mobile only */}
          <div className={styles.dots}>
            {testimonialsData.testimonials.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
                onClick={() => {
                  if (videoRefs.current[active]) {
                    videoRefs.current[active].pause()
                    const np = [...playingStates]
                    np[active] = false
                    setPlayingStates([...np])
                  }
                  setActive(i)
                }}
                aria-label={`Go to ${i + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
