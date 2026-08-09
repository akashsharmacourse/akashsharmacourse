import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen,
  MessageCircle, User, LogOut, Sun, Moon
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { sidebarData } from '../../data/data.js'
import styles from './Sidebar.module.css'

const iconMap = {
  LayoutDashboard, BookOpen,
  MessageCircle, User,
}

export default function Sidebar({ mobileOpen, onClose }) {
  const { logout, userData } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className={styles.overlay} onClick={onClose} />
      )}

      <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ''}`}>
        {/* Logo */}
        <div className={styles.logoWrap}>
          <img
            src="https://i.ibb.co/k6qGF2t6/IMG-2488-JPG.jpg"
            alt={sidebarData.logoAlt}
            className={styles.logo}
            onError={(e) => {
              // Gracefully handle missing logo by falling back to text
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              if (parent && !parent.querySelector(`.${styles.fallbackLogo}`)) {
                const text = document.createElement('span');
                text.className = styles.fallbackLogo;
                text.innerText = 'Akash Sharma';
                parent.appendChild(text);
              }
            }}
          />
        </div>

        {/* User info */}
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {userData?.name?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div className={styles.userText}>
            <span className={styles.userName}>
              {userData?.name || 'Student'}
            </span>
            <span className={styles.userEmail}>
              {userData?.email || ''}
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav className={styles.nav}>
          {sidebarData.links.map((link) => {
            const Icon = iconMap[link.icon]
            return (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
                onClick={onClose}
              >
                {Icon && <Icon size={18} />}
                <span>{link.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div className={styles.bottomActions}>
          {/* Theme toggle */}
          <button className={styles.themeBtn} onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>

          {/* Logout */}
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={16} />
            <span>{sidebarData.logout}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
