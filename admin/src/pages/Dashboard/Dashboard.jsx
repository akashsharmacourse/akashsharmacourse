import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../config/firebase.js'
import { Users, BookOpen, IndianRupee, TrendingUp } from 'lucide-react'
import styles from './Dashboard.module.css'

const iconMap = { Users, BookOpen, IndianRupee, TrendingUp }

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalRevenue: 0,
    thisMonth: 0,
  })
  const [recentStudents, setRecentStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch students
      const usersSnap = await getDocs(collection(db, 'users'))
      const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }))

      // Fetch courses
      const coursesSnap = await getDocs(collection(db, 'courses'))

      // Calculate revenue
      const totalRevenue = users.reduce((sum, u) => sum + (u.paymentAmount || 0), 0)

      // This month students
      const thisMonth = users.filter(u => {
        if (!u.createdAt) return false
        const created = new Date(u.createdAt)
        const now = new Date()
        return created.getMonth() === now.getMonth() &&
               created.getFullYear() === now.getFullYear()
      }).length

      setStats({
        totalStudents: users.length,
        totalCourses: coursesSnap.size,
        totalRevenue,
        thisMonth,
      })

      // Recent 5 students
      setRecentStudents(
        users
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
      )
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    }
    setLoading(false)
  }

  const statCards = [
    { icon: 'Users', label: 'Total Students', value: stats.totalStudents },
    { icon: 'BookOpen', label: 'Total Courses', value: stats.totalCourses },
    { icon: 'IndianRupee', label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}` },
    { icon: 'TrendingUp', label: 'This Month', value: `${stats.thisMonth} students` },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Overview</h2>
        <span className={styles.sub}>Welcome back, Admin</span>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {statCards.map((stat, i) => {
          const Icon = iconMap[stat.icon]
          return (
            <div key={i} className={styles.statCard}>
              <div className={styles.statIcon}>
                {Icon && <Icon size={20} />}
              </div>
              <div>
                <div className={styles.statValue}>{loading ? '—' : stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent students */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Recent Enrollments</h3>
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Name</span>
            <span>Email</span>
            <span>Phone</span>
            <span>Amount</span>
            <span>Date</span>
          </div>
          {recentStudents.length > 0 ? recentStudents.map((s) => (
            <div key={s.id} className={styles.tableRow}>
              <span className={styles.studentName}>{s.name || '—'}</span>
              <span className={styles.studentEmail}>{s.email || '—'}</span>
              <span>{s.phone || '—'}</span>
              <span className={styles.amount}>
                {s.paymentAmount ? `₹${s.paymentAmount.toLocaleString('en-IN')}` : '—'}
              </span>
              <span className={styles.date}>
                {s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN') : '—'}
              </span>
            </div>
          )) : (
            <div className={styles.emptyRow}>No students enrolled yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
