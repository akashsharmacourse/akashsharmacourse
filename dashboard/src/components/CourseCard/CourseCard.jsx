import { BookOpen, ChevronRight } from 'lucide-react'
import ProgressBar from '../ProgressBar/ProgressBar.jsx'
import styles from './CourseCard.module.css'

export default function CourseCard({ course, onClick }) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.thumbnail}>
        <BookOpen size={36} className={styles.thumbnailIcon} />
        {course.tag && <span className={styles.tag}>{course.tag}</span>}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{course.title}</h3>
        <p className={styles.description}>{course.description}</p>
        
        <div className={styles.footer}>
          <div className={styles.progressSection}>
            <span className={styles.progressLabel}>Course Progress</span>
            <ProgressBar value={course.progress || 0} showText={true} />
          </div>
          <div className={styles.actionBtn}>
            <span>Continue</span>
            <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </div>
  )
}
