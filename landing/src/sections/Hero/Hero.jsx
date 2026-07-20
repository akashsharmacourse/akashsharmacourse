import React, { useRef, useState } from 'react';
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
  const [muted, setMuted] = useState(true)
  const [progress, setProgress] = useState(0)

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play()
      setPlaying(true)
    } else {
      videoRef.current.pause()
      setPlaying(false)
    }
  }

  const toggleMute = () => {
    videoRef.current.muted = !videoRef.current.muted
    setMuted(!muted)
  }

  const handleProgress = () => {
    if (!videoRef.current || !videoRef.current.duration) return
    const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100
    setProgress(percent)
  }

  const handleSeek = (e) => {
    if (!videoRef.current || !videoRef.current.duration) return
    const bar = e.currentTarget
    const rect = bar.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = x / rect.width
    videoRef.current.currentTime = percent * videoRef.current.duration
    setProgress(percent * 100)
  }

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

        <div className={styles.videoCard}>
          <video
            ref={videoRef}
            className={styles.heroVideo}
            src={heroData.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            controlsList="nodownload"
            onContextMenu={e => e.preventDefault()}
            onTimeUpdate={handleProgress}
          />

          {/* Custom Controls */}
          <div className={styles.videoControls}>
            {/* Progress bar */}
            <div
              className={styles.progressBar}
              onClick={handleSeek}
            >
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Buttons */}
            <div className={styles.controlButtons}>
              <button
                className={styles.controlBtn}
                onClick={togglePlay}
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

