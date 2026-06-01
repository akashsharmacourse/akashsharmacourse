import { Play, FileText, CheckCircle2, Circle, Lock } from 'lucide-react'
import styles from './ChapterItem.module.css'

export default function ChapterItem({
  lesson,
  isActive = false,
  isLocked = false,
  isCompleted = false,
  onSelect,
  onToggleComplete,
}) {
  const Icon = lesson.type === 'video' ? Play : FileText

  const handleClick = (e) => {
    if (isLocked) return
    onSelect?.(lesson)
  }

  const handleCheckboxClick = (e) => {
    e.stopPropagation()
    if (isLocked) return
    onToggleComplete?.(lesson.id)
  }

  return (
    <div
      className={`${styles.item} ${isActive ? styles.active : ''} ${isLocked ? styles.locked : ''}`}
      onClick={handleClick}
    >
      <div className={styles.leftSection}>
        {/* Completion status checkbox button */}
        <button
          className={`${styles.checkBtn} ${isCompleted ? styles.completed : ''}`}
          onClick={handleCheckboxClick}
          disabled={isLocked}
          aria-label={isCompleted ? "Mark lesson as incomplete" : "Mark lesson as complete"}
        >
          {isCompleted ? (
            <CheckCircle2 size={16} className={styles.completedIcon} />
          ) : (
            <Circle size={16} className={styles.incompleteIcon} />
          )}
        </button>

        <div className={styles.iconWrap}>
          {isLocked ? <Lock size={14} className={styles.lockIcon} /> : <Icon size={14} className={styles.typeIcon} />}
        </div>

        <div className={styles.textWrap}>
          <span className={styles.title}>{lesson.title}</span>
          <span className={styles.duration}>
            {lesson.type === 'video' ? lesson.duration || '0:00' : 'PDF Document'}
          </span>
        </div>
      </div>
    </div>
  )
}
