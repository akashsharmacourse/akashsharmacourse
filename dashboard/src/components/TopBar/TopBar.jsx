import { Menu } from 'lucide-react'
import styles from './TopBar.module.css'

export default function TopBar({ onMenuClick, title }) {
  return (
    <header className={styles.topBar}>
      <button
        className={styles.menuBtn}
        onClick={onMenuClick}
        aria-label="Toggle sidebar"
      >
        <Menu size={22} />
      </button>
      <h1 className={styles.title}>{title}</h1>
    </header>
  )
}
