import { Video, Calendar } from 'lucide-react'
import { liveSessionsData } from '../../data/data.js'
import styles from './LiveSessions.module.css'

export default function LiveSessions() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.heading}>{liveSessionsData.heading}</h2>
        <p className={styles.sub}>{liveSessionsData.subheading}</p>
      </div>

      {/* Upcoming */}
      <div className={styles.section}>
        <div className={styles.empty}>
          <Calendar size={40} className={styles.emptyIcon} />
          <p>{liveSessionsData.empty}</p>
        </div>
      </div>

      {/* Past recordings */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{liveSessionsData.pastHeading}</h3>
        <div className={styles.empty}>
          <Video size={40} className={styles.emptyIcon} />
          <p>{liveSessionsData.pastEmpty}</p>
        </div>
      </div>
    </div>
  )
}
