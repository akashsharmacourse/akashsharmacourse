// 


import React, { useRef, useState, useEffect } from 'react';
import { heroData } from '../../data/data.js';
import { useInView } from '../../hooks/useInView';
import { useCountUp } from '../../hooks/useCountUp';
import { Play, Pause, Volume2, VolumeX, TrendingUp as BadgeIcon } from 'lucide-react';
import styles from './Hero.module.css';

function StatItem({ stat, inView, index }) {
  const count = useCountUp(stat.value, 2000, inView);
  return (
    <div
      className={styles.statItem}
      style={{ '--i': index }}
    >
      <span className={styles.statValue}>
        {count.toLocaleString()}{stat.suffix}
      </span>
      <span className={styles.statLabel}>{stat.label}</span>
    </div>
  );
}

export function Hero() {
  const [ref, inView] = useInView(0.05);

  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showControls, setShowControls] = useState(false)
  const controlsTimer = useRef(null)

  const handleVideoClick = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setPlaying(true)
    } else {
      videoRef.current.pause()
      setPlaying(false)
    }
  }

  const toggleMute = (e) => {
    e.stopPropagation()
    if (!videoRef.current) return
    videoRef.current.muted = !muted
    setMuted(!muted)
  }

  const handleProgress = () => {
    if (!videoRef.current || !videoRef.current.duration) return
    const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100
    setProgress(percent)
  }

  const handleSeek = (e) => {
    e.stopPropagation()
    if (!videoRef.current || !videoRef.current.duration) return
    const bar = e.currentTarget
    const rect = bar.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = x / rect.width
    videoRef.current.currentTime = percent * videoRef.current.duration
  }

  const showControlsTemporarily = () => {
    setShowControls(true)
    clearTimeout(controlsTimer.current)
    controlsTimer.current = setTimeout(() => {
      setShowControls(false)
    }, 2000)
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const isMobile = window.innerWidth <= 768

    if (isMobile) {
      // Mobile — muted autoplay (browser allows this)
      video.muted = true
      setMuted(true)
      video.play().then(() => {
        setPlaying(true)
      }).catch(() => {})
    } else {
      // Desktop — unmuted autoplay
      video.muted = false
      setMuted(false)
      video.play().then(() => {
        setPlaying(true)
        video.muted = false
        setMuted(false)
      }).catch(() => {
        // Blocked — try muted
        video.muted = true
        video.play().then(() => {
          setPlaying(true)
          setTimeout(() => {
            video.muted = false
            setMuted(false)
          }, 100)
        }).catch(() => {})
      })
    }
  }, [])

  // On page visibility change (reload fix)
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden && videoRef.current) {
        const isMobile = window.innerWidth <= 768
        if (!isMobile) {
          videoRef.current.muted = false
          setMuted(false)
        }
        videoRef.current.play().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  return (
    <section 
      id="hero" 
      ref={ref}
      className={`${styles.hero} ${inView ? styles.visible : ''}`}
      aria-label="Akash Sharma Stock Market Coach Hero"
    >
      <div className={styles.gridOverlay}></div>
      <div className={styles.radialGlow}></div>

      <div className={styles.container}>
        <span className={styles.badge}>
          <BadgeIcon size={8} /> 10+ YEARS OF PROFITABLE TRADING
        </span>

        <h1 className={styles.headline}>
          <span className={styles.headlineWhite}>Master the Stock Market.</span>
          <span className={styles.headlineAccent}>Trade With Precision.</span>
        </h1>

        <div
          className={styles.videoCard}
          onMouseMove={showControlsTemporarily}
          onMouseLeave={() => setShowControls(false)}
          onTouchStart={showControlsTemporarily}
          onClick={handleVideoClick}
        >
          <video
            ref={videoRef}
            className={styles.heroVideo}
            src={heroData.videoUrl}
            loop
            playsInline
            onTimeUpdate={handleProgress}
            onContextMenu={e => e.preventDefault()}
          />

          {/* Controls — only on hover/touch */}
          <div className={`${styles.videoControls} ${showControls ? styles.controlsVisible : ''}`}>
            <div
              className={styles.progressBar}
              onClick={handleSeek}
            >
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className={styles.controlButtons}>
              <button
                className={styles.controlBtn}
                onClick={handleVideoClick}
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing
                  ? <Pause size={16} fill="currentColor" />
                  : <Play size={16} fill="currentColor" />
                }
              </button>
              <button
                className={styles.controlBtn}
                onClick={toggleMute}
                aria-label={muted ? 'Unmute' : 'Mute'}
              >
                {muted
                  ? <VolumeX size={16} />
                  : <Volume2 size={16} />
                }
              </button>
            </div>
          </div>
        </div>

        <p className={styles.subheadline}>
          {heroData.subheadline}
        </p>

        <div className={styles.buttons}>
          <a href="/enroll" className={styles.btnPrimary}>{heroData.ctaPrimary}</a>
          <a href="#results" className={styles.btnSecondary}>{heroData.ctaSecondary}</a>
        </div>

        <div className={`${styles.stats} ${inView ? styles.visible : ''}`}>
          {heroData.stats.map((stat, i) => (
            <StatItem key={i} stat={stat} inView={inView} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default React.memo(Hero);