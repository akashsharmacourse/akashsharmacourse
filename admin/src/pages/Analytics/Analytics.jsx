import { useEffect, useState } from 'react'
import styles from './Analytics.module.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET

export default function Analytics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/stats/usage`, {
        headers: { 'x-admin-secret': ADMIN_SECRET }
      })
      const data = await res.json()
      if (data.success) {
        setStats(data)
        setLastUpdated(new Date().toLocaleTimeString('en-IN'))
      }
    } catch (err) {
      console.error('Stats fetch error:', err)
    }
    setLoading(false)
  }

  if (loading) return <div className={styles.loading}>Loading stats...</div>
  if (!stats) return <div className={styles.loading}>Failed to load stats.</div>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.heading}>System Analytics</h2>
          <p className={styles.sub}>Last updated: {lastUpdated}</p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchStats}>
          ↻ Refresh
        </button>
      </div>

      {/* Firebase Stats */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🔥 Firebase</h3>
        <div className={styles.grid4}>
          {[
            { label: 'Total Students', value: stats.firebase.totalStudents },
            { label: 'Active Students', value: stats.firebase.activeStudents },
            { label: 'Expired Access', value: stats.firebase.expiredStudents },
            { label: 'Total Revenue', value: `₹${stats.firebase.totalRevenue.toLocaleString('en-IN')}` },
          ].map((s, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cloudinary Stats */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>☁️ Cloudinary</h3>
        <div className={styles.grid4}>
          {[
            {
              label: 'Credits',
              value: `${stats.cloudinary.credits.used} / ${stats.cloudinary.credits.limit}`,
              percent: stats.cloudinary.credits.percent,
              warning: stats.cloudinary.credits.percent > 80,
            },
            {
              label: 'Storage',
              value: `${stats.cloudinary.storage.used} GB / 25 GB`,
              percent: (stats.cloudinary.storage.used / 25 * 100).toFixed(1),
              warning: stats.cloudinary.storage.used > 20,
            },
            {
              label: 'Bandwidth',
              value: `${stats.cloudinary.bandwidth.used} GB / 25 GB`,
              percent: (stats.cloudinary.bandwidth.used / 25 * 100).toFixed(1),
              warning: stats.cloudinary.bandwidth.used > 20,
            },
            {
              label: 'Transformations',
              value: `${stats.cloudinary.transformations.used} / ${stats.cloudinary.transformations.limit}`,
              percent: (stats.cloudinary.transformations.used / stats.cloudinary.transformations.limit * 100).toFixed(1),
              warning: stats.cloudinary.transformations.used > 20000,
            },
          ].map((s, i) => (
            <div key={i} className={`${styles.statCard} ${s.warning ? styles.warningCard : ''}`}>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
              <div className={styles.usageBar}>
                <div
                  className={`${styles.usageFill} ${s.warning ? styles.usageWarning : ''}`}
                  style={{ width: `${Math.min(s.percent, 100)}%` }}
                />
              </div>
              <div className={styles.statPercent}>{s.percent}% used</div>
            </div>
          ))}
        </div>
      </div>

      {/* Resend Stats */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>📧 Resend</h3>
        <div className={styles.grid4}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.resend.total}</div>
            <div className={styles.statLabel}>Emails Sent</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>3,000</div>
            <div className={styles.statLabel}>Monthly Limit</div>
          </div>
        </div>
      </div>

      {/* Render */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🖥️ Render</h3>
        <div className={styles.renderCard}>
          <p>Check manually — Render API not available on free tier</p>
          <a
            href="https://dashboard.render.com/billing"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.renderLink}
          >
            Open Render Dashboard →
          </a>
        </div>
      </div>

    </div>
  )
}
