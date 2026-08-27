import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { doc, getDoc, updateDoc, collection, query, where, limit, getDocs } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '../../config/firebase.js'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  Play, Pause, Volume2, VolumeX,
  Maximize, Minimize,
  ChevronDown, ChevronRight, FileText,
  CheckCircle, ArrowLeft
} from 'lucide-react'
import styles from './CoursePlayer.module.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

function SecureVideoPlayer({ publicId, studentName, studentEmail }) {
  const [videoUrl, setVideoUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const controlsTimerRef = useRef(null)

  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showRateMenu, setShowRateMenu] = useState(false)

  const rates = [0.5, 0.75, 1, 1.25, 1.5, 2]

  useEffect(() => {
    if (!publicId) return
    fetchSignedUrl()
  }, [publicId])

  const fetchSignedUrl = async () => {
    setLoading(true)
    setError(null)
    try {
      // Agar direct URL hai (Bunny/http) — directly use karo
      if (publicId.startsWith('http')) {
        setVideoUrl(publicId)
        setLoading(false)
        return
      }

      // Cloudinary public_id — backend se signed URL lo
      const auth = getAuth()
      const token = await auth.currentUser.getIdToken()
      const encodedId = encodeURIComponent(publicId)
      const res = await fetch(`${BACKEND_URL}/api/video/signed-url/${encodedId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setVideoUrl(data.url)
      } else {
        setError('Failed to load video.')
      }
    } catch {
      setError('Failed to load video.')
    }
    setLoading(false)
  }

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const showControlsTemporarily = () => {
    setShowControls(true)
    clearTimeout(controlsTimerRef.current)
    controlsTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false)
    }, 3000)
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) { videoRef.current.play(); setPlaying(true) }
    else { videoRef.current.pause(); setPlaying(false) }
    showControlsTemporarily()
  }

  const toggleMute = () => {
    videoRef.current.muted = !muted
    setMuted(!muted)
  }

  const handleVolume = (e) => {
    const val = parseFloat(e.target.value)
    videoRef.current.volume = val
    setVolume(val)
    setMuted(val === 0)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const curr = videoRef.current.currentTime
    const dur = videoRef.current.duration
    setCurrentTime(curr)
    if (dur) {
      setProgress((curr / dur) * 100)
      if (!duration || duration !== dur) setDuration(dur)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      console.log('Duration:', videoRef.current?.duration)
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    videoRef.current.currentTime = percent * videoRef.current.duration
    setProgress(percent * 100)
    showControlsTemporarily()
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  const changeRate = (rate) => {
    videoRef.current.playbackRate = rate
    setPlaybackRate(rate)
    setShowRateMenu(false)
  }

  // DRM Protection
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const preventRightClick = (e) => e.preventDefault()
    video.addEventListener('contextmenu', preventRightClick)
    const preventShortcuts = (e) => {
      if ((e.ctrlKey && ['s','u','i','j'].includes(e.key.toLowerCase())) || e.key === 'F12') {
        e.preventDefault()
      }
    }
    document.addEventListener('keydown', preventShortcuts)
    const devToolsCheck = setInterval(() => {
      if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
        video.pause()
        setPlaying(false)
      }
    }, 1000)
    return () => {
      video.removeEventListener('contextmenu', preventRightClick)
      document.removeEventListener('keydown', preventShortcuts)
      clearInterval(devToolsCheck)
    }
  }, [videoUrl])

  if (loading) return (
    <div className={styles.videoLoading}>
      <div className={styles.spinner} />
      <p>Loading secure video...</p>
    </div>
  )

  if (error) return (
    <div className={styles.videoError}>
      <p>{error}</p>
      <button onClick={fetchSignedUrl} className={styles.retryBtn}>Retry</button>
    </div>
  )

  return (
    <div
      ref={containerRef}
      className={styles.videoWrapper}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={togglePlay}
      onContextMenu={e => e.preventDefault()}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className={styles.video}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={handleLoadedMetadata}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        playsInline
      />

      {/* Watermarks */}
      <div className={styles.watermarkTopLeft}>
        {studentName} | {studentEmail}
      </div>
      <div className={styles.watermarkCenter}>
        {studentName} | {studentEmail}
      </div>
      <div className={styles.watermarkBottomRight}>
        {studentName} | {studentEmail}
      </div>

      {/* Controls */}
      <div
        className={`${styles.controls} ${showControls ? styles.controlsVisible : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.progressBar} onClick={handleSeek}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          <div className={styles.progressThumb} style={{ left: `${progress}%` }} />
        </div>

        <div className={styles.controlsBottom}>
          <div className={styles.controlsLeft}>
            <button className={styles.controlBtn} onClick={togglePlay}>
              {playing
                ? <Pause size={18} fill="white" color="white" />
                : <Play size={18} fill="white" color="white" />
              }
            </button>
            <div className={styles.volumeWrap}>
              <button className={styles.controlBtn} onClick={toggleMute}>
                {muted || volume === 0
                  ? <VolumeX size={18} color="white" />
                  : <Volume2 size={18} color="white" />
                }
              </button>
              <input
                type="range" min="0" max="1" step="0.1"
                value={muted ? 0 : volume}
                onChange={handleVolume}
                className={styles.volumeSlider}
                onClick={e => e.stopPropagation()}
              />
            </div>
            <span className={styles.timeDisplay}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className={styles.controlsRight}>
            <div className={styles.rateWrap}>
              <button
                className={styles.controlBtn}
                onClick={e => { e.stopPropagation(); setShowRateMenu(!showRateMenu) }}
              >
                <span className={styles.rateText}>{playbackRate}x</span>
              </button>
              {showRateMenu && (
                <div className={styles.rateMenu}>
                  {rates.map(r => (
                    <button
                      key={r}
                      className={`${styles.rateOption} ${playbackRate === r ? styles.rateActive : ''}`}
                      onClick={e => { e.stopPropagation(); changeRate(r) }}
                    >
                      {r}x
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className={styles.controlBtn} onClick={e => { e.stopPropagation(); toggleFullscreen() }}>
              {isFullscreen
                ? <Minimize size={18} color="white" />
                : <Maximize size={18} color="white" />
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Course Player ────────────────────────────────
export default function CoursePlayer() {
  const { courseId } = useParams()
  const { userData } = useAuth()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeVideo, setActiveVideo] = useState(null)
  const [expandedChapter, setExpandedChapter] = useState(0)
  const [completing, setCompleting] = useState(false)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [showPdf, setShowPdf] = useState(false)

  useEffect(() => {
    if (!userData) return

    const isExpired = userData?.accessExpiresAt && 
      new Date(userData.accessExpiresAt) < new Date()
    const isRevoked = userData?.hasAccess === false

    if (isExpired || isRevoked) {
      navigate('/courses')
      return
    }

    const fetchCourse = async () => {
      try {
        const coursesSnap = await getDocs(
          query(
            collection(db, 'courses'),
            where('published', '==', true),
            limit(1)
          )
        )
        if (coursesSnap.empty) { setLoading(false); return }
        const snap = coursesSnap.docs[0]
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() }
          setCourse(data)
          // Auto select first video
          if (data.chapters?.[0]?.videos?.[0]) {
            setActiveVideo({
              ...data.chapters[0].videos[0],
              chapterIdx: 0,
              videoIdx: 0,
            })
          }
        }
      } catch (err) {
        console.error('Fetch course error:', err)
      }
      setLoading(false)
    }
    fetchCourse()
  }, [userData, navigate])

  // Mark video complete
  const markComplete = async () => {
    if (!activeVideo || !course || !userData) return
    setCompleting(true)
    try {
      const auth = getAuth()
      const completedKey = `${activeVideo.chapterIdx}_${activeVideo.videoIdx}`
      const existingCompleted = userData.completedChapters || []
      if (!existingCompleted.includes(completedKey)) {
        const completedSet = new Set(existingCompleted)
        completedSet.add(completedKey)
        const completed = Array.from(completedSet)
        const userRef = doc(db, 'users', auth.currentUser.uid)

        // Calculate progress
        const totalVideos = course.chapters.reduce(
          (sum, ch) => sum + (ch.videos?.length || 0), 0
        )
        
        // Cap progress at 100%
        const progress = totalVideos > 0
          ? Math.min(Math.round((completed.length / totalVideos) * 100), 100)
          : 0

        await updateDoc(userRef, {
          completedChapters: completed,
          progress,
        })
      }

      // Go to next video
      goToNext()
    } catch (err) {
      console.error('Mark complete error:', err)
    }
    setCompleting(false)
  }

  const goToNext = () => {
    if (!course || !activeVideo) return
    const { chapterIdx, videoIdx } = activeVideo
    const chapter = course.chapters[chapterIdx]

    if (videoIdx < (chapter.videos?.length || 0) - 1) {
      // Next video in same chapter
      setActiveVideo({
        ...chapter.videos[videoIdx + 1],
        chapterIdx,
        videoIdx: videoIdx + 1,
      })
    } else if (chapterIdx < course.chapters.length - 1) {
      // First video of next chapter
      setExpandedChapter(chapterIdx + 1)
      setActiveVideo({
        ...course.chapters[chapterIdx + 1].videos[0],
        chapterIdx: chapterIdx + 1,
        videoIdx: 0,
      })
    }
  }

  const goToPrev = () => {
    if (!course || !activeVideo) return
    const { chapterIdx, videoIdx } = activeVideo

    if (videoIdx > 0) {
      const chapter = course.chapters[chapterIdx]
      setActiveVideo({
        ...chapter.videos[videoIdx - 1],
        chapterIdx,
        videoIdx: videoIdx - 1,
      })
    } else if (chapterIdx > 0) {
      const prevChapter = course.chapters[chapterIdx - 1]
      const lastVideoIdx = (prevChapter.videos?.length || 1) - 1
      setExpandedChapter(chapterIdx - 1)
      setActiveVideo({
        ...prevChapter.videos[lastVideoIdx],
        chapterIdx: chapterIdx - 1,
        videoIdx: lastVideoIdx,
      })
    }
  }

  const isCompleted = (chapterIdx, videoIdx) => {
    const key = `${chapterIdx}_${videoIdx}`
    return userData?.completedChapters?.includes(key)
  }

  const openPdf = (pdfUrl) => {
    setPdfUrl(pdfUrl)
    setShowPdf(true)
  }

  if (loading) return (
    <div className={styles.loading}>Loading course...</div>
  )
  if (!course) return (
    <div className={styles.loading}>Course not found.</div>
  )

  const totalVideos = course.chapters?.reduce(
    (sum, ch) => sum + (ch.videos?.length || 0), 0
  ) || 0
  const completedCount = Math.min(
    userData?.completedChapters?.length || 0,
    totalVideos
  )
  const progress = totalVideos > 0
    ? Math.min(Math.round((completedCount / totalVideos) * 100), 100)
    : 0

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <Link to="/courses" className={styles.backBtn}>
          <ArrowLeft size={16} /> Back to Courses
        </Link>
        <div className={styles.headerRight}>
          <span className={styles.courseTitle}>{course.title}</span>
          <span className={styles.progressText}>
            {Math.min(completedCount, totalVideos)} / {totalVideos} Lessons ({progress}%)
          </span>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Left — Video Player */}
        <div className={styles.playerSection}>
          {activeVideo ? (
            <>
              {activeVideo.videoUrl ? (
                <SecureVideoPlayer
                  publicId={activeVideo.videoUrl}
                  studentName={userData?.name || 'Student'}
                  studentEmail={userData?.email || ''}
                />
              ) : (
                <div className={styles.pdfOnlyLesson}>
                  <FileText size={48} className={styles.pdfBigIcon} />
                  <p>This lesson contains study material only</p>
                  <button
                    className={styles.pdfBtn}
                    onClick={() => openPdf(activeVideo.pdfUrl)}
                  >
                    <FileText size={15} />
                    Open Study Material
                  </button>
                </div>
              )}

              <div className={styles.videoInfo}>
                <h2 className={styles.videoTitle}>{activeVideo.title}</h2>
                {activeVideo.pdfUrl && activeVideo.videoUrl && (
                  <button
                    className={styles.pdfBtn}
                    onClick={() => openPdf(activeVideo.pdfUrl)}
                  >
                    <FileText size={15} />
                    View Study Material
                  </button>
                )}
              </div>
              <div className={styles.navButtons}>
                <button className={styles.prevBtn} onClick={goToPrev}>
                  Previous
                </button>
                <button
                  className={styles.completeBtn}
                  onClick={markComplete}
                  disabled={completing}
                >
                  <CheckCircle size={16} />
                  {completing ? 'Saving...' : 'Mark Complete'}
                </button>
                <button
                  className={styles.nextBtn}
                  onClick={goToNext}
                  disabled={!isCompleted(activeVideo?.chapterIdx, activeVideo?.videoIdx)}
                  style={{
                    opacity: isCompleted(activeVideo?.chapterIdx, activeVideo?.videoIdx) ? 1 : 0.4,
                    cursor: isCompleted(activeVideo?.chapterIdx, activeVideo?.videoIdx) ? 'pointer' : 'not-allowed'
                  }}
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className={styles.selectPrompt}>
              <Play size={40} className={styles.promptIcon} />
              <p>Select a lesson to start watching</p>
            </div>
          )}
        </div>

        {/* Right — Curriculum */}
        <aside className={styles.curriculum}>
          <div className={styles.curriculumHeader}>
            <h3>Course Curriculum</h3>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={styles.progressLabel}>
              Your Progress {progress}%
            </span>
          </div>

          <div className={styles.chapterList}>
            {course.chapters?.map((chapter, ci) => (
              <div key={ci} className={styles.chapterItem}>
                <button
                  className={`${styles.chapterBtn} ${expandedChapter === ci ? styles.expanded : ''}`}
                  onClick={() => setExpandedChapter(expandedChapter === ci ? null : ci)}
                >
                  <span className={styles.chapterTitle}>{chapter.title}</span>
                  <ChevronDown size={14} className={styles.chevron} />
                </button>

                {expandedChapter === ci && (
                  <div className={styles.videoList}>
                    {chapter.videos?.map((video, vi) => (
                      <button
                        key={vi}
                        className={`${styles.videoBtn} ${
                          activeVideo?.chapterIdx === ci &&
                          activeVideo?.videoIdx === vi
                            ? styles.activeVideo : ''
                        }`}
                         onClick={() => {
                          setActiveVideo({
                            ...video, chapterIdx: ci, videoIdx: vi
                          })
                          if (!video.videoUrl && video.pdfUrl) {
                            openPdf(video.pdfUrl)
                          }
                        }}
                      >
                        <div className={styles.videoBtnLeft}>
                          {isCompleted(ci, vi) ? (
                            <CheckCircle size={14} className={styles.completedIcon} />
                          ) : (
                            <ChevronRight size={14} />
                          )}
                          <span>{video.title}</span>
                        </div>
                        {video.duration && (
                          <span className={styles.duration}>{video.duration}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>

      {showPdf && pdfUrl && (
        <div className={styles.pdfModal}>
          <div className={styles.pdfModalHeader}>
            <span>Study Material</span>
            <button
              className={styles.pdfCloseBtn}
              onClick={() => { setShowPdf(false); setPdfUrl(null) }}
            >
              ✕
            </button>
          </div>
          <iframe
            src={pdfUrl}
            className={styles.pdfIframe}
            title="Study Material"
          />
        </div>
      )}
    </div>
  )
}
