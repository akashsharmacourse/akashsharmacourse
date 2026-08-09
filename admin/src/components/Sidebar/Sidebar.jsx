import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, Users,
  BarChart2, LogOut, Sun, Moon
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { sidebarData } from '../../data/data.js'
import styles from './Sidebar.module.css'

const iconMap = { LayoutDashboard, BookOpen, Users, BarChart2 }

export default function Sidebar({ mobileOpen, onClose }) {
  const { logout, admin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      {mobileOpen && <div className={styles.overlay} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ''}`}>

        {/* Logo */}
        <div className={styles.logoWrap}>
          <img
            src="https://i.ibb.co/k6qGF2t6/IMG-2488-JPG.jpg"
            alt={sidebarData.logoAlt}
            className={styles.logo}
            onError={(e) => {
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              if (parent && !parent.querySelector(`.${styles.fallbackTextLogo}`)) {
                const text = document.createElement('span');
                text.className = styles.fallbackTextLogo;
                text.innerText = 'Akash Sharma';
                parent.insertBefore(text, parent.querySelector(`.${styles.adminBadge}`));
              }
            }}
          />
          <span className={styles.adminBadge}>Admin</span>
        </div>

        {/* Admin info */}
        <div className={styles.adminInfo}>
          <div className={styles.avatar}>A</div>
          <div className={styles.adminText}>
            <span className={styles.adminName}>{admin?.name || 'Super Admin'}</span>
            <span className={styles.adminEmail}>{admin?.email || ''}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className={styles.nav}>
          {sidebarData.links.map((link) => {
            const Icon = iconMap[link.icon]
            return (
              <NavLink
                key={link.href}
                to={link.href}
                end={link.href === '/'}
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

        {/* Bottom */}
        <div className={styles.bottomActions}>
          <button className={styles.themeBtn} onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={16} />
            <span>{sidebarData.logout}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
