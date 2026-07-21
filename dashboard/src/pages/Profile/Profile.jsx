import { useState } from 'react'
import { User, Mail, Lock, Key, Award, Clock, BookOpen, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { updatePassword } from 'firebase/auth'
import { auth } from '../../config/firebase.js'
import styles from './Profile.module.css'

export default function Profile() {
  const { user, userData } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passError, setPassError] = useState('')
  const [passSuccess, setPassSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPassError('')
    setPassSuccess('')

    if (!newPassword || !confirmPassword) {
      setPassError('Please fill out all fields')
      return
    }
    if (newPassword.length < 6) {
      setPassError('Password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setPassError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword)
        setPassSuccess('Password updated successfully!')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPassError('No authenticated user found. Please login again.')
      }
    } catch (err) {
      console.error(err)
      setPassError('Failed to update password. Please logout and login again to reset.')
    }
    setLoading(false)
  }

  const enrolledCount = userData?.enrolledCourses?.length || 0
  const completedCount = userData?.completedChapters?.length || 0
  const watchTime = userData?.watchTimeMinutes || 0

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>Student Profile</h2>

      <div className={styles.layout}>
        {/* Profile Card & Info */}
        <div className={styles.profileSection}>
          <div className={styles.card}>
            <div className={styles.header}>
              <div className={styles.avatar}>
                {userData?.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div className={styles.meta}>
                <h3 className={styles.name}>{userData?.name || 'Student'}</h3>
                <span className={styles.badge}>Official Student</span>
              </div>
            </div>

            <div className={styles.detailsList}>
              <div className={styles.detailItem}>
                <Mail size={16} className={styles.detailIcon} />
                <div className={styles.detailText}>
                  <span className={styles.label}>Email Address</span>
                  <span className={styles.value}>{userData?.email || user?.email || 'N/A'}</span>
                </div>
              </div>
              <div className={styles.detailItem}>
                <ShieldCheck size={16} className={styles.detailIcon} />
                <div className={styles.detailText}>
                  <span className={styles.label}>Session Lock ID</span>
                  <span className={styles.valueMono}>
                    {userData?.activeSessionId?.substring(0, 18) + '...' || 'No Session Locked'}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.enrollInfo}>
              <div className={styles.enrollItem}>
                <span className={styles.enrollLabel}>Member Since</span>
                <span className={styles.enrollValue}>
                  {userData?.createdAt
                    ? new Date(userData.createdAt).toLocaleDateString('en-IN')
                    : '—'}
                </span>
              </div>
              <div className={styles.enrollItem}>
                <span className={styles.enrollLabel}>Completed Lessons</span>
                <span className={styles.enrollValue}>
                  {new Set(userData?.completedChapters || []).size}
                </span>
              </div>
              <div className={styles.enrollItem}>
                <span className={styles.enrollLabel}>Overall Progress</span>
                <span className={styles.enrollValue}>
                  {Math.min(userData?.progress || 0, 100)}%
                </span>
              </div>
              <div className={styles.enrollItem}>
                <span className={styles.enrollLabel}>Amount Paid</span>
                <span className={styles.enrollValue}>
                  {userData?.paymentAmount ? `₹${userData.paymentAmount.toLocaleString('en-IN')}` : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Change password card */}
        <div className={styles.securitySection}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Key size={18} className={styles.cardTitleIcon} />
              <span>Change Password</span>
            </h3>

            {passError && <div className={styles.errorBox}>{passError}</div>}
            {passSuccess && <div className={styles.successBox}>{passSuccess}</div>}

            <form onSubmit={handlePasswordChange} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.formLabel}>New Password</label>
                <div className={styles.inputWrap}>
                  <Lock size={16} className={styles.inputIcon} />
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.formLabel}>Confirm Password</label>
                <div className={styles.inputWrap}>
                  <Lock size={16} className={styles.inputIcon} />
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={styles.submitBtn}
              >
                {loading ? <div className={styles.spinner} /> : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
