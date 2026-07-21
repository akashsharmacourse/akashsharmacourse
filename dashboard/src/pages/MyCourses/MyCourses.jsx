import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, limit, getDocs } from 'firebase/firestore'
import { db } from '../../config/firebase.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { BookOpen, ChevronRight } from 'lucide-react'
import styles from './MyCourses.module.css'

export default function MyCourses() {
  const { userData } = useAuth()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)

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
        if (snap.exists()) setCourse({ id: snap.id, ...snap.data() })
      } catch (err) {
        console.error('Fetch course error:', err)
      }
      setLoading(false)
    }
    if (userData) fetchCourse()
  }, [userData])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.heading}>My Courses</h2>
        <span className={styles.count}>{course ? '1' : '0'} enrolled</span>
      </div>

      {loading ? (
        <div className={styles.empty}>
          <p>Loading...</p>
        </div>
      ) : course ? (
        <div className={styles.grid}>
          <div
            className={styles.card}
            onClick={() => navigate(`/courses/${course.id}`)}
          >
            <div className={styles.thumbnail}>
              {course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className={styles.thumbnailImg}
                  loading="lazy"
                />
              ) : (
                <BookOpen size={32} className={styles.thumbnailIcon} />
              )}
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.courseTitle}>{course.title}</h3>
              <p className={styles.courseDesc}>{course.description}</p>
              <div className={styles.cardFooter}>
                <div className={styles.progressWrap}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${Math.min(userData?.progress || 0, 100)}%` }}
                    />
                  </div>
                  <span className={styles.progressText}>
                    {Math.min(userData?.progress || 0, 100)}% complete
                  </span>
                </div>
                <ChevronRight size={18} className={styles.arrow} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.empty}>
          <BookOpen size={48} className={styles.emptyIcon} />
          <h3>No Courses Yet</h3>
          <p>Complete your enrollment to access your course content.</p>
        </div>
      )}
    </div>
  )
}
