import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { ChevronLeft, ChevronDown, ChevronUp, BookOpen, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { db } from '../../config/firebase.js'
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer.jsx'
import PDFViewer from '../../components/PDFViewer/PDFViewer.jsx'
import ChapterItem from '../../components/ChapterItem/ChapterItem.jsx'
import styles from './CoursePlayer.module.css'

export default function CoursePlayer() {
  const { courseId } = useParams()
  const { user, userData } = useAuth()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [activeLesson, setActiveLesson] = useState(null)
  const [openChapters, setOpenChapters] = useState({})
  const [completedLessons, setCompletedLessons] = useState(new Set())
  const [loading, setLoading] = useState(true)

  // Load Course and Syllabus data from Firestore
  useEffect(() => {
    const fetchCourse = async () => {
      // Access check
      if (!userData?.hasAccess || !userData?.enrolledCourseId) {
        navigate('/courses')
        return
      }
      try {
        const snap = await getDoc(doc(db, 'courses', userData.enrolledCourseId))
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() }
          setCourse(data)
          // Auto expand first chapter and select first lesson
          if (data.chapters?.length > 0) {
            setOpenChapters({ [data.chapters[0].id]: true })
            if (data.chapters[0].lessons?.length > 0) {
              setActiveLesson(data.chapters[0].lessons[0])
            }
          }
        }
      } catch (err) {
        console.error('Fetch course error:', err)
      }
      setLoading(false)
    }
    if (userData) fetchCourse()
  }, [userData])

  // Synchronize completed lessons state from user Firestore metadata
  useEffect(() => {
    if (userData?.completedChapters) {
      setCompletedLessons(new Set(userData.completedChapters))
    }
  }, [userData])

  const toggleChapter = (chapterId) => {
    setOpenChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }))
  }

  // Toggle completion status in state and Firestore
  const handleToggleComplete = async (lessonId) => {
    if (!user) return

    const userRef = doc(db, 'users', user.uid)
    const isCompletedNow = completedLessons.has(lessonId)

    try {
      if (isCompletedNow) {
        // Remove from completed
        await updateDoc(userRef, {
          completedChapters: arrayRemove(lessonId)
        })
        completedLessons.delete(lessonId)
        setCompletedLessons(new Set(completedLessons))
      } else {
        // Add to completed
        await updateDoc(userRef, {
          completedChapters: arrayUnion(lessonId)
        })
        completedLessons.add(lessonId)
        setCompletedLessons(new Set(completedLessons))
      }
    } catch (err) {
      console.error('Failed to sync completion status to Firestore:', err)
      // Optimistic local state toggle in case database is not writeable
      if (isCompletedNow) {
        completedLessons.delete(lessonId)
      } else {
        completedLessons.add(lessonId)
      }
      setCompletedLessons(new Set(completedLessons))
    }
  }

  // Automatic transition to next lesson on video end
  const handleVideoEnded = () => {
    if (!course || !activeLesson) return

    // Auto mark complete on video end
    if (!completedLessons.has(activeLesson.id)) {
      handleToggleComplete(activeLesson.id)
    }

    // Find current indices
    let found = false
    for (let c = 0; c < course.chapters.length; c++) {
      const chapter = course.chapters[c]
      for (let l = 0; l < chapter.lessons.length; l++) {
        const lesson = chapter.lessons[l]
        if (found) {
          setActiveLesson(lesson)
          setOpenChapters(prev => ({ ...prev, [chapter.id]: true }))
          return
        }
        if (lesson.id === activeLesson.id) {
          found = true
        }
      }
    }
  }

  const navigateLesson = (direction) => {
    if (!course || !activeLesson) return

    // Build flat array of lessons
    const flatLessons = []
    course.chapters.forEach(ch => flatLessons.push(...ch.lessons))

    const currentIndex = flatLessons.findIndex(l => l.id === activeLesson.id)
    if (direction === 'next' && currentIndex < flatLessons.length - 1) {
      setActiveLesson(flatLessons[currentIndex + 1])
    } else if (direction === 'prev' && currentIndex > 0) {
      setActiveLesson(flatLessons[currentIndex - 1])
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    )
  }

  if (!course) {
    return (
      <div className={styles.error}>
        <AlertCircle size={40} className={styles.errorIcon} />
        <h3>Course Not Found</h3>
        <p>We could not retrieve the details for this course.</p>
        <Link to="/courses" className={styles.backBtn}>Back to Courses</Link>
      </div>
    )
  }

  // Calculate stats
  const totalLessons = course.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)
  const completedLessonsCount = Array.from(completedLessons).filter(id => {
    // Check if the completed id belongs to current course lessons
    return course.chapters.some(ch => ch.lessons.some(l => l.id === id))
  }).length
  const progressPercent = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0

  return (
    <div className={styles.page}>
      {/* Back button header */}
      <div className={styles.topHeader}>
        <Link to="/courses" className={styles.backLink}>
          <ChevronLeft size={16} />
          <span>Back to Courses</span>
        </Link>
        <div className={styles.courseMeta}>
          <span className={styles.courseTitleHeader}>{course.title}</span>
          <span className={styles.progressCounter}>
            {completedLessonsCount} / {totalLessons} Lessons ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Primary two-pane theater layout */}
      <div className={styles.layout}>
        
        {/* Left column: Active Media Player viewport */}
        <div className={styles.playerContainer}>
          <div className={styles.mediaViewport}>
            {activeLesson ? (
              activeLesson.type === 'video' ? (
                <VideoPlayer
                  url={activeLesson.url}
                  title={activeLesson.title}
                  onEnded={handleVideoEnded}
                />
              ) : (
                <PDFViewer
                  url={activeLesson.url}
                  title={activeLesson.title}
                />
              )
            ) : (
              <div className={styles.noActiveLesson}>
                <BookOpen size={48} className={styles.placeholderIcon} />
                <p>Select a lesson from the curriculum sidebar to begin learning.</p>
              </div>
            )}
          </div>

          {/* Player footer control buttons */}
          {activeLesson && (
            <div className={styles.playerFooter}>
              <div className={styles.lessonMeta}>
                <h3 className={styles.activeTitle}>{activeLesson.title}</h3>
                <span className={styles.activeType}>
                  Type: {activeLesson.type === 'video' ? 'Lecture Video' : 'PDF Study Guide'}
                </span>
              </div>
              <div className={styles.navRow}>
                <button
                  onClick={() => navigateLesson('prev')}
                  className={styles.navBtn}
                  disabled={
                    !course ||
                    activeLesson.id === course.chapters[0].lessons[0].id
                  }
                >
                  Previous
                </button>

                <button
                  onClick={() => handleToggleComplete(activeLesson.id)}
                  className={`${styles.completeToggleBtn} ${completedLessons.has(activeLesson.id) ? styles.isCompleted : ''}`}
                >
                  <CheckCircle size={15} />
                  <span>{completedLessons.has(activeLesson.id) ? 'Completed' : 'Mark Complete'}</span>
                </button>

                <button
                  onClick={() => navigateLesson('next')}
                  className={styles.navBtn}
                  disabled={
                    !course ||
                    activeLesson.id === course.chapters[course.chapters.length - 1].lessons[course.chapters[course.chapters.length - 1].lessons.length - 1].id
                  }
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Interactive Curriculum Accordion Sidebar */}
        <aside className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Course Curriculum</h3>
          <div className={styles.progressWrap}>
            <div className={styles.progressLabels}>
              <span>Your Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className={styles.chaptersList}>
            {course.chapters.map((chapter) => {
              const isOpen = !!openChapters[chapter.id]
              return (
                <div key={chapter.id} className={styles.chapterGroup}>
                  {/* Chapter header trigger toggle */}
                  <button
                    className={styles.chapterTrigger}
                    onClick={() => toggleChapter(chapter.id)}
                  >
                    <span className={styles.chapterTitle}>{chapter.title}</span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {/* Chapter lessons collapsible content */}
                  {isOpen && (
                    <div className={styles.lessonsContainer}>
                      {chapter.lessons.map((lesson) => {
                        const isLActive = activeLesson?.id === lesson.id
                        const isLCompleted = completedLessons.has(lesson.id)

                        return (
                          <ChapterItem
                            key={lesson.id}
                            lesson={lesson}
                            isActive={isLActive}
                            isCompleted={isLCompleted}
                            isLocked={false} // Permits free learning exploration
                            onSelect={setActiveLesson}
                            onToggleComplete={handleToggleComplete}
                          />
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </aside>

      </div>
    </div>
  )
}
