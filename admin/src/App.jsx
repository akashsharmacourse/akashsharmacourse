import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx'
import Sidebar from './components/Sidebar/Sidebar.jsx'
import TopBar from './components/TopBar/TopBar.jsx'
import Login from './pages/Login/Login.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import Courses from './pages/Courses/Courses.jsx'
import CourseDetail from './pages/CourseDetail/CourseDetail.jsx'
import Students from './pages/Students/Students.jsx'
import Analytics from './pages/Analytics/Analytics.jsx'
import styles from './App.module.css'

const pageTitles = {
  '/': 'Dashboard',
  '/courses': 'Courses',
  '/students': 'Students',
  '/analytics': 'Analytics',
}

function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Admin Panel'

  return (
    <div className={styles.layout}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={styles.main}>
        <TopBar onMenuClick={() => setMobileOpen(true)} title={title} />
        <div className={styles.content}>{children}</div>
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
                <AdminLayout><Dashboard /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/courses" element={
              <ProtectedRoute>
                <AdminLayout><Courses /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/courses/:courseId" element={
              <ProtectedRoute>
                <AdminLayout><CourseDetail /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/students" element={
              <ProtectedRoute>
                <AdminLayout><Students /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <AdminLayout><Analytics /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
