import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../config/firebase.js'
import { BarChart2, TrendingUp, DollarSign, Award, BookOpen, Users } from 'lucide-react'
import styles from './Analytics.module.css'

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalStudents: 0,
    totalCourses: 0,
    avgCompletionRate: 0,
  })
  const [coursePopularity, setCoursePopularity] = useState([]) // Array of { title, count, percent }
  const [cloudinaryStats, setCloudinaryStats] = useState(null)

  useEffect(() => {
    fetchAnalytics()
    fetchCloudinaryStats()
  }, [])

  const fetchCloudinaryStats = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/stats/usage`, {
        headers: { 'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET }
      })
      const data = await res.json()
      if (data.success) setCloudinaryStats(data.cloudinary)
    } catch (err) {
      console.error('Stats fetch error:', err)
    }
  }

  const fetchAnalytics = async () => {
    try {
      // 1. Fetch Students
      const usersSnap = await getDocs(collection(db, 'users'))
      const students = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }))

      // 2. Fetch Courses
      const coursesSnap = await getDocs(collection(db, 'courses'))
      const courses = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() }))

      // Calculate revenue
      const totalRevenue = students.reduce((sum, u) => sum + (u.paymentAmount || 0), 0)

      // Calculate average student syllabus progress
      let sumProgress = 0
      students.forEach(student => {
        sumProgress += student.progress || 0
      })
      const avgCompletionRate = students.length > 0 ? Math.round(sumProgress / students.length) : 0

      // Calculate course popularity distribution
      const courseCounts = {}
      courses.forEach(c => {
        courseCounts[c.id] = { title: c.title, count: 0 }
      })

      students.forEach(student => {
        student.enrolledCourses?.forEach(c => {
          if (courseCounts[c.id]) {
            courseCounts[c.id].count += 1
          }
        })
      })

      const popularityArray = Object.values(courseCounts)
        .sort((a, b) => b.count - a.count)
        .map(item => {
          const maxCount = students.length || 1
          return {
            ...item,
            percent: Math.round((item.count / maxCount) * 100)
          }
        })

      setStats({
        totalRevenue,
        totalStudents: students.length,
        totalCourses: courses.length,
        avgCompletionRate,
      })
      setCoursePopularity(popularityArray)
    } catch (err) {
      console.error('Fetch analytics error:', err)
    }
    setLoading(false)
  }

  const cards = [
    { icon: DollarSign, label: 'Gross Revenues', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, color: 'var(--success)' },
    { icon: Users, label: 'Student Enrollments', value: stats.totalStudents, color: 'var(--accent)' },
    { icon: BookOpen, label: 'Active Catalogs', value: stats.totalCourses, color: '#3b82f6' },
    { icon: Award, label: 'Average Progress', value: `${stats.avgCompletionRate}%`, color: '#ec4899' },
  ]

  if (loading) {
    return <div className={styles.loading}>Generating analytical models...</div>
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Analytics</h2>
        <p className={styles.sub}>Real-time performance metrics and distribution ratios</p>
      </div>

      {/* Grid numbers */}
      <div className={styles.cardsGrid}>
        {cards.map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>{card.label}</span>
                <Icon size={18} style={{ color: card.color }} />
              </div>
              <span className={styles.cardValue}>{card.value}</span>
            </div>
          )
        })}
      </div>

      {/* Primary Analytics Content */}
      <div className={styles.chartLayout}>
        {/* Popularity meters */}
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>
            <BarChart2 size={18} className={styles.titleIcon} />
            <span>Course Enrollment Share</span>
          </h3>
          <p className={styles.sectionSub}>Student registration percentages by course</p>

          <div className={styles.metersList}>
            {coursePopularity.length > 0 ? coursePopularity.map((item, idx) => (
              <div key={idx} className={styles.meterItem}>
                <div className={styles.meterLabels}>
                  <span className={styles.courseTitle}>{item.title}</span>
                  <span className={styles.countText}>
                    {item.count} {item.count === 1 ? 'student' : 'students'} ({item.percent}%)
                  </span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${item.percent}%`, background: 'var(--accent)' }}
                  />
                </div>
              </div>
            )) : (
              <div className={styles.emptyShare}>No course distribution statistics available.</div>
            )}
          </div>
        </div>

        {/* Learning engagement summary */}
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>
            <TrendingUp size={18} className={styles.titleIcon} />
            <span>Student Performance Distribution</span>
          </h3>
          <p className={styles.sectionSub}>Average syllabus completions and metrics</p>

          <div className={styles.engagementBody}>
            <div className={styles.circularMetrics}>
              <div className={styles.progressCircle}>
                <div className={styles.circleValue}>{stats.avgCompletionRate}%</div>
                <div className={styles.circleLabel}>Avg Progress</div>
              </div>
            </div>

            <div className={styles.bulletsList}>
              <div className={styles.bulletItem}>
                <div className={styles.bulletDot} style={{ background: 'var(--success)' }} />
                <div className={styles.bulletTexts}>
                  <span className={styles.bulletTitle}>Completed Syllabus Index</span>
                  <span className={styles.bulletDesc}>Average percentage of total chapters ticked by student accounts.</span>
                </div>
              </div>
              <div className={styles.bulletItem}>
                <div className={styles.bulletDot} style={{ background: 'var(--accent)' }} />
                <div className={styles.bulletTexts}>
                  <span className={styles.bulletTitle}>Conversion Value Ratio</span>
                  <span className={styles.bulletDesc}>Revenue yielded relative to overall registered accounts catalog.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cloudinary Usage Section */}
      {cloudinaryStats && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>☁️ Cloudinary Usage</h3>
          <div className={styles.statsGrid}>
            {[
              {
                label: 'Credits Used',
                value: `${cloudinaryStats.credits.used} / ${cloudinaryStats.credits.limit}`,
                percent: cloudinaryStats.credits.percent,
                warning: cloudinaryStats.credits.percent > 80,
              },
              {
                label: 'Storage',
                value: `${cloudinaryStats.storage.used} GB / 25 GB`,
                percent: (cloudinaryStats.storage.used / 25 * 100).toFixed(1),
                warning: cloudinaryStats.storage.used > 20,
              },
              {
                label: 'Bandwidth',
                value: `${cloudinaryStats.bandwidth.used} GB / 25 GB`,
                percent: (cloudinaryStats.bandwidth.used / 25 * 100).toFixed(1),
                warning: cloudinaryStats.bandwidth.used > 20,
              },
              {
                label: 'Transformations',
                value: `${cloudinaryStats.transformations.used} / ${cloudinaryStats.transformations.limit}`,
                percent: (cloudinaryStats.transformations.used / cloudinaryStats.transformations.limit * 100).toFixed(1),
                warning: cloudinaryStats.transformations.used > 20000,
              },
            ].map((stat, i) => (
              <div key={i} className={`${styles.statCard} ${stat.warning ? styles.warningCard : ''}`}>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
                <div className={styles.usageBar}>
                  <div
                    className={`${styles.usageFill} ${stat.warning ? styles.usageWarning : ''}`}
                    style={{ width: `${Math.min(stat.percent, 100)}%` }}
                  />
                </div>
                <div className={styles.statPercent}>{stat.percent}% used</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
