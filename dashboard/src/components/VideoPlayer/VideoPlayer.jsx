import { useState, useRef, useEffect } from 'react'
import {
  Play, Pause, Volume2, VolumeX, Maximize,
  Minimize, RotateCcw, Settings, FastForward
} from 'lucide-react'
import styles from './VideoPlayer.module.css'

export default function VideoPlayer({ url, title, onEnded }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)

  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const controlsTimeoutRef = useRef(null)

  useEffect(() => {
    // Reset state on URL change
    setIsPlaying(false)
    setCurrentTime(0)
    setPlaybackRate(1)
    if (videoRef.current) {
      videoRef.current.load()
    }
  }, [url])

  // Mouse move makes controls visible
  const handleMouseMove = () => {
    setControlsVisible(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setControlsVisible(false)
      }
    }, 2500)
  }

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime
      setCurrentTime(seekTime)
    }
  }

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value)
    setVolume(vol)
    if (videoRef.current) {
      videoRef.current.volume = vol
      videoRef.current.muted = vol === 0
      setIsMuted(vol === 0)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMute = !isMuted
      videoRef.current.muted = nextMute
      setIsMuted(nextMute)
    }
  }

  const changeSpeed = (rate) => {
    setPlaybackRate(rate)
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
    }
    setShowSpeedMenu(false)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error(err))
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
    }
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const handleVideoEnded = () => {
    setIsPlaying(false)
    onEnded?.()
  }

  // Handle keys inside component
  const handleKeyDown = (e) => {
    if (e.key === ' ') {
      e.preventDefault()
      togglePlay()
    }
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${isFullscreen ? styles.fullscreen : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setControlsVisible(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <video
        ref={videoRef}
        src={url}
        className={styles.video}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleVideoEnded}
        playsInline
      />

      {/* Glassmorphic overlay controls */}
      <div className={`${styles.overlay} ${controlsVisible ? styles.visible : ''}`}>
        <div className={styles.topInfo}>
          <span className={styles.videoTitle}>{title || 'Lecture Video'}</span>
        </div>

        <div className={styles.bottomControls}>
          {/* Seeker line */}
          <div className={styles.timelineContainer}>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className={styles.timeline}
              style={{
                background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${
                  (currentTime / (duration || 100)) * 100
                }%, rgba(255,255,255,0.2) ${
                  (currentTime / (duration || 100)) * 100
                }%, rgba(255,255,255,0.2) 100%)`
              }}
            />
          </div>

          <div className={styles.controlsRow}>
            <div className={styles.leftGroup}>
              {/* Play/Pause */}
              <button className={styles.controlBtn} onClick={togglePlay}>
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              </button>

              {/* Reset/Replay */}
              <button
                className={styles.controlBtn}
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime = 0
                }}
              >
                <RotateCcw size={16} />
              </button>

              {/* Volume */}
              <div className={styles.volumeContainer}>
                <button className={styles.controlBtn} onClick={toggleMute}>
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className={styles.volumeSlider}
                  style={{
                    background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${
                      (isMuted ? 0 : volume) * 100
                    }%, rgba(255,255,255,0.2) ${
                      (isMuted ? 0 : volume) * 100
                    }%, rgba(255,255,255,0.2) 100%)`
                  }}
                />
              </div>

              {/* Duration labels */}
              <span className={styles.timeLabel}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className={styles.rightGroup}>
              {/* Speed Menu trigger */}
              <div className={styles.speedTriggerWrap}>
                <button
                  className={`${styles.controlBtn} ${styles.speedBtn}`}
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                >
                  <Settings size={16} />
                  <span>{playbackRate}x</span>
                </button>

                {showSpeedMenu && (
                  <div className={styles.speedMenu}>
                    {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        className={`${styles.speedOption} ${playbackRate === rate ? styles.activeRate : ''}`}
                        onClick={() => changeSpeed(rate)}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button className={styles.controlBtn} onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
