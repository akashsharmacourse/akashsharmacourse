import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { doc, getDoc, updateDoc, collection, query, where, limit, getDocs } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '../../config/firebase.js'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  ChevronDown, ChevronRight, FileText,
  Lock, CheckCircle, ArrowLeft, Play,
  AlertCircle
} from 'lucide-react'
import styles from './CoursePlayer.module.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

// ── Secure Video Player ───────────────────────────────
function SecureVideoPlayer({ publicId, studentName, studentEmail }) {
  console.log('BACKEND_URL:', BACKEND_URL)
  console.log('PublicId:', publicId)

  const [videoUrl, setVideoUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const videoRef = useRef(null)

  useEffect(() => {
    if (!publicId) return
    fetchSignedUrl()
  }, [publicId])

  const fetchSignedUrl = async () => {
    setLoading(true)
    setError(null)
    try {
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
        setError('Failed to load video. Please try again.')
      }
    } catch (err) {
      console.error('Video URL fetch error:', err)
      setError('Failed to load video. Please try again.')
    }
    setLoading(false)
  }

  // ── DRM Protection ────────────────────────────────
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Disable right click on video
    const preventRightClick = (e) => e.preventDefault()
    video.addEventListener('contextmenu', preventRightClick)

    // Pause on devtools open
    const handleVisibilityChange = () => {
      if (document.hidden) video.pause()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Detect devtools
    let devtoolsOpen = false
    const threshold = 160
    const checkDevTools = () => {
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        if (!devtoolsOpen) {
          devtoolsOpen = true
          video.pause()
        }
      } else {
        devtoolsOpen = false
      }
    }
    const devToolsInterval = setInterval(checkDevTools, 1000)

    // Disable keyboard shortcuts
    const preventShortcuts = (e) => {
      if (
        (e.ctrlKey && ['s', 'u', 'i', 'j', 'c'].includes(e.key.toLowerCase())) ||
        e.key === 'F12'
      ) {
        e.preventDefault()
      }
    }
    document.addEventListener('keydown', preventShortcuts)

    return () => {
      video.removeEventListener('contextmenu', preventRightClick)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('keydown', preventShortcuts)
      clearInterval(devToolsInterval)
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
      <AlertCircle size={32} />
      <p>{error}</p>
      <button onClick={fetchSignedUrl} className={styles.retryBtn}>
        Retry
      </button>
    </div>
  )

  return (
    <div className={styles.videoWrapper} onContextMenu={e => e.preventDefault()}>
      <video
        ref={videoRef}
        src={videoUrl}
        className={styles.video}
        controls
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        playsInline
      />
      {/* Watermark overlay */}
      <div className={styles.watermark}>
        {studentName} | {studentEmail}
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

  useEffect(() => {
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
    if (userData) fetchCourse()
  }, [userData])

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

  const openPdf = async (pdfPublicId) => {
    try {
      const auth = getAuth()
      const token = await auth.currentUser.getIdToken()
      const encodedId = encodeURIComponent(pdfPublicId)

      const res = await fetch(`${BACKEND_URL}/api/video/signed-pdf/${encodedId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        window.open(data.url, '_blank')
      }
    } catch (err) {
      console.error('PDF open error:', err)
    }
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
              <SecureVideoPlayer
                publicId={activeVideo.videoUrl}
                studentName={userData?.name || 'Student'}
                studentEmail={userData?.email || ''}
              />
              <div className={styles.videoInfo}>
                <h2 className={styles.videoTitle}>{activeVideo.title}</h2>
                {activeVideo.pdfUrl && (
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
                <button className={styles.nextBtn} onClick={goToNext}>
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
                        onClick={() => setActiveVideo({
                          ...video, chapterIdx: ci, videoIdx: vi
                        })}
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
    </div>
  )
}
