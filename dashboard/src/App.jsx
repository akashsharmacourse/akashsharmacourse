import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx'
import Sidebar from './components/Sidebar/Sidebar.jsx'
import TopBar from './components/TopBar/TopBar.jsx'
import Login from './pages/Login/Login.jsx'
import Home from './pages/Home/Home.jsx'
import MyCourses from './pages/MyCourses/MyCourses.jsx'
import CoursePlayer from './pages/CoursePlayer/CoursePlayer.jsx'
import Support from './pages/Support/Support.jsx'
import Profile from './pages/Profile/Profile.jsx'
import styles from './App.module.css'

const pageTitles = {
  '/': 'Home',
  '/courses': 'My Courses',
  '/support': 'Support',
  '/profile': 'Profile',
}

function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const title = pageTitles[window.location.pathname] || 'Dashboard'

  return (
    <div className={styles.layout}>
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className={styles.main}>
        <TopBar
          onMenuClick={() => setMobileOpen(true)}
          title={title}
        />
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Home />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/courses" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MyCourses />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/courses/:courseId" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CoursePlayer />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/support" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Support />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
