import styles from './ProgressBar.module.css'

export default function ProgressBar({ value = 0, showText = false }) {
  const percentage = Math.min(100, Math.max(0, value))

  return (
    <div className={styles.container}>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showText && (
        <span className={styles.text}>{percentage}%</span>
      )}
    </div>
  )
}
