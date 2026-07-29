import { useState, useRef, useCallback, memo } from 'react'
import { testimonialsData } from '../../data/data.js'
import { useInView } from '../../hooks/useInView'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import styles from './Testimonials.module.css'

// ── VideoCard OUTSIDE — never remounts ──────────────
const VideoCard = memo(({ t, i, isPlaying, isMuted, videoProgress, onPlay, onMute, onSeek, onProgress, onEnded, videoRef }) => {
  return (
    <div className={styles.card}>
      <div className={styles.videoArea}>
        <video
          ref={(el) => {
            if (el) {
              // Safari fix — set muted directly on DOM
              el.muted = true
              el.defaultMuted = true
              videoRef(el)
            }
          }}
          src={t.videoUrl}
          className={styles.video}
          preload="auto"
          loop
          playsInline
          onTimeUpdate={onProgress}
          onEnded={onEnded}
          onContextMenu={e => e.preventDefault()}
        />

        {!isPlaying && (
          <button className={styles.centerPlay} onClick={onPlay} aria-label="Play">
            <Play size={28} fill="white" color="white" />
          </button>
        )}

        <div className={styles.controls}>
          <div className={styles.progressBar} onClick={onSeek}>
            <div className={styles.progressFill} style={{ width: `${videoProgress}%` }} />
          </div>
          <div className={styles.controlRow}>
            <button className={styles.controlBtn} onClick={onPlay}>
              {isPlaying
                ? <Pause size={13} fill="white" color="white" />
                : <Play size={13} fill="white" color="white" />
              }
            </button>
            <button className={styles.controlBtn} onClick={onMute}>
              {isMuted
                ? <VolumeX size={13} color="white" />
                : <Volume2 size={13} color="white" />
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

VideoCard.displayName = 'VideoCard'

// ── Main Component ───────────────────────────────────
export default function Testimonials() {
  const [sectionRef, inView] = useInView()
  const [activePlay, setActivePlay] = useState(-1)
  const [mutedMap, setMutedMap] = useState({})
  const [progressMap, setProgressMap] = useState({})
  const [activeSlide, setActiveSlide] = useState(0)
  const videoRefs = useRef({})
  const startX = useRef(0)
  const total = testimonialsData.testimonials.length

  const pauseAll = useCallback((exceptIdx = -1) => {
    Object.entries(videoRefs.current).forEach(([idx, video]) => {
      if (video && parseInt(idx) !== exceptIdx) {
        video.pause()
        video.currentTime = 0
      }
    })
  }, [])

  const handlePlay = useCallback((i) => {
    const video = videoRefs.current[i]
    if (!video) return

    if (!video.paused) {
      video.pause()
      setActivePlay(-1)
      return
    }

    pauseAll(i)

    // Safari fix — set muted false directly on DOM
    video.muted = false
    video.defaultMuted = false
    setMutedMap(prev => ({ ...prev, [i]: false }))

    video.play()
      .then(() => setActivePlay(i))
      .catch(() => {
        // Fallback muted
        video.muted = true
        video.defaultMuted = true
        setMutedMap(prev => ({ ...prev, [i]: true }))
        video.play()
          .then(() => setActivePlay(i))
          .catch(err => console.error('Play failed:', err))
      })
  }, [pauseAll])

  const handleMute = useCallback((i) => {
    const video = videoRefs.current[i]
    if (!video) return
    const newMuted = !video.muted
    video.muted = newMuted
    setMutedMap(prev => ({ ...prev, [i]: newMuted }))
  }, [])

  const handleProgress = useCallback((i) => {
    const video = videoRefs.current[i]
    if (!video || !video.duration) return
    setProgressMap(prev => ({
      ...prev,
      [i]: (video.currentTime / video.duration) * 100
    }))
  }, [])

  const handleSeek = useCallback((e, i) => {
    e.stopPropagation()
    const video = videoRefs.current[i]
    if (!video) return
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    video.currentTime = percent * video.duration
  }, [])

  const handleEnded = useCallback((i) => {
    setActivePlay(prev => prev === i ? -1 : prev)
  }, [])

  const handleTouchStart = useCallback((e) => {
    startX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((e) => {
    const diff = startX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) < 50) return
    if (diff > 0 && activeSlide < total - 1) {
      if (videoRefs.current[activeSlide]) videoRefs.current[activeSlide].pause()
      setActivePlay(-1)
      setActiveSlide(prev => prev + 1)
    } else if (diff < 0 && activeSlide > 0) {
      if (videoRefs.current[activeSlide]) videoRefs.current[activeSlide].pause()
      setActivePlay(-1)
      setActiveSlide(prev => prev - 1)
    }
  }, [activeSlide, total])

  const setVideoRef = useCallback((i) => (el) => {
    if (el) videoRefs.current[i] = el
  }, [])

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
          {testimonialsData.testimonials.map((t, i) => (
            <VideoCard
              key={`desktop-${t.id}`}
              t={t}
              i={i}
              isPlaying={activePlay === i}
              isMuted={mutedMap[i] ?? true}
              videoProgress={progressMap[i] ?? 0}
              videoRef={setVideoRef(i)}
              onPlay={() => handlePlay(i)}
              onMute={() => handleMute(i)}
              onSeek={(e) => handleSeek(e, i)}
              onProgress={() => handleProgress(i)}
              onEnded={() => handleEnded(i)}
            />
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
            {testimonialsData.testimonials.map((t, i) => (
              <div key={`mobile-${t.id}`} className={styles.mobileSlide}>
                <VideoCard
                  t={t}
                  i={`m${i}`}
                  isPlaying={activePlay === `m${i}`}
                  isMuted={mutedMap[`m${i}`] ?? true}
                  videoProgress={progressMap[`m${i}`] ?? 0}
                  videoRef={setVideoRef(`m${i}`)}
                  onPlay={() => handlePlay(`m${i}`)}
                  onMute={() => handleMute(`m${i}`)}
                  onSeek={(e) => handleSeek(e, `m${i}`)}
                  onProgress={() => handleProgress(`m${i}`)}
                  onEnded={() => handleEnded(`m${i}`)}
                />
              </div>
            ))}
          </div>

          <div className={styles.dots}>
            {testimonialsData.testimonials.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === activeSlide ? styles.dotActive : ''}`}
                onClick={() => {
                  const mKey = `m${activeSlide}`
                  if (videoRefs.current[mKey]) videoRefs.current[mKey].pause()
                  setActivePlay(-1)
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
