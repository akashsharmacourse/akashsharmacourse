import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { BookOpen, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { homeData } from '../../data/data.js'
import styles from './Home.module.css'

const iconMap = { BookOpen, CheckCircle, Clock, TrendingUp }

export default function Home() {
  const { userData } = useAuth()

  const stats = [
    { icon: 'BookOpen', label: 'Enrolled Courses', value: userData?.hasAccess ? 1 : 0 },
    { icon: 'CheckCircle', label: 'Completed Chapters', value: userData?.completedChapters?.length || 0 },
    { icon: 'Clock', label: 'Watch Time', value: `${userData?.watchTimeMinutes || 0} mins` },
    { icon: 'TrendingUp', label: 'Overall Progress', value: `${userData?.progress || 0}%` },
  ]

  return (
    <div className={styles.page}>
      {/* Greeting */}
      <div className={styles.greeting}>
        <h2 className={styles.greetingText}>
          {homeData.greeting},{' '}
          <span className={styles.name}>
            {userData?.name?.split(' ')[0] || 'Student'}
          </span>
        </h2>
        <p className={styles.sub}>{homeData.subheading}</p>
      </div>

      {/* Stats grid */}
      <div className={styles.statsGrid}>
        {stats.map((stat, i) => {
          const Icon = iconMap[stat.icon]
          return (
            <div key={i} className={styles.statCard}>
              <div className={styles.statIcon}>
                {Icon && <Icon size={20} />}
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Continue learning */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Continue Learning</h3>
        {userData?.hasAccess && userData?.enrolledCourseId ? (
          <div className={styles.courseGrid}>
            <div className={styles.courseCard}>
              <div className={styles.courseInfo}>
                <span className={styles.courseTitle}>Stock Market Mastery Programme</span>
                <span className={styles.courseProgress}>
                  {userData?.progress || 0}% complete
                </span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${userData?.progress || 0}%` }}
                />
              </div>
              <Link to={`/courses/${userData.enrolledCourseId}`} className={styles.continueBtn}>
                Continue
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <BookOpen size={40} className={styles.emptyIcon} />
            <p>No courses enrolled yet.</p>
            <p className={styles.emptySubtext}>
              Complete your enrollment to access your course.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
