import { useState, useRef } from 'react'
import { testimonialsData } from '../../data/data.js'
import { useInView } from '../../hooks/useInView'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import styles from './Testimonials.module.css'

export default function Testimonials() {
  const [ref, inView] = useInView()
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

  const handlePlay = (i) => {
    const video = videoRefs.current[i]
    if (!video) return

    if (video.paused) {
      // Pause all others
      videoRefs.current.forEach((v, idx) => {
        if (v && idx !== i) {
          v.pause()
          v.currentTime = 0
          const np = [...playingStates]
          np[idx] = false
          setPlayingStates(np)
        }
      })
      // Play this one unmuted
      video.muted = false
      video.play()
      const np = [...playingStates]
      np[i] = true
      setPlayingStates(np)
      const nm = [...mutedStates]
      nm[i] = false
      setMutedStates(nm)
    } else {
      video.pause()
      const np = [...playingStates]
      np[i] = false
      setPlayingStates(np)
    }
  }

  const toggleMute = (e, i) => {
    e.stopPropagation()
    const video = videoRefs.current[i]
    if (!video) return
    video.muted = !mutedStates[i]
    const nm = [...mutedStates]
    nm[i] = !mutedStates[i]
    setMutedStates(nm)
  }

  const handleTimeUpdate = (i) => {
    const video = videoRefs.current[i]
    if (!video || !video.duration) return
    const np = [...progressStates]
    np[i] = (video.currentTime / video.duration) * 100
    setProgressStates(np)
  }

  const handleSeek = (e, i) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const video = videoRefs.current[i]
    if (video) video.currentTime = percent * video.duration
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

        <div className={styles.grid}>
          {testimonialsData.testimonials.map((t, i) => (
            <div key={t.id} className={styles.card}>
              <div className={styles.videoArea}>
                <video
                  ref={el => videoRefs.current[i] = el}
                  src={t.videoUrl}
                  className={styles.video}
                  preload="auto"
                  loop
                  playsInline
                  muted={mutedStates[i]}
                  onTimeUpdate={() => handleTimeUpdate(i)}
                  onEnded={() => {
                    const np = [...playingStates]
                    np[i] = false
                    setPlayingStates(np)
                  }}
                  onContextMenu={e => e.preventDefault()}
                />

                {/* Center play button — shows when paused */}
                {!playingStates[i] && (
                  <button
                    className={styles.centerPlay}
                    onClick={() => handlePlay(i)}
                    aria-label="Play"
                  >
                    <Play size={28} fill="white" color="white" />
                  </button>
                )}

                {/* Bottom controls */}
                <div className={styles.controls}>
                  <div
                    className={styles.progressBar}
                    onClick={(e) => handleSeek(e, i)}
                  >
                    <div
                      className={styles.progressFill}
                      style={{ width: `${progressStates[i]}%` }}
                    />
                  </div>
                  <div className={styles.controlRow}>
                    <button
                      className={styles.controlBtn}
                      onClick={() => handlePlay(i)}
                    >
                      {playingStates[i]
                        ? <Pause size={13} fill="white" color="white" />
                        : <Play size={13} fill="white" color="white" />
                      }
                    </button>
                    <button
                      className={styles.controlBtn}
                      onClick={(e) => toggleMute(e, i)}
                    >
                      {mutedStates[i]
                        ? <VolumeX size={13} color="white" />
                        : <Volume2 size={13} color="white" />
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
