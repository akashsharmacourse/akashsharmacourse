import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import styles from './Login.module.css'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Please fill all fields'); return }
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError('Invalid credentials or not authorized as admin.')
    }
    setLoading(false)
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <img
            src="https://res.cloudinary.com/tmgtqqqg/image/upload/v1785589653/IMG_2488.JPG_qgh8kt.jpg"
            alt="AskAkashSharma Logo"
            style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
          />
        </div>
        <h1 className={styles.heading}>Admin Login</h1>
        <p className={styles.sub}>AskAkashSharma — Admin Panel</p>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <div className={styles.inputWrap}>
              <Mail size={15} className={styles.inputIcon} />
              <input
                type="email" name="email"
                value={form.email} onChange={handleChange}
                placeholder="Admin email"
                className={styles.input}
                autoComplete="email"
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <Lock size={15} className={styles.inputIcon} />
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password} onChange={handleChange}
                placeholder="Admin password"
                className={styles.input}
                autoComplete="current-password"
              />
              <button type="button" className={styles.eyeBtn}
                onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Login to Admin Panel'}
          </button>
        </form>
      </div>
    </main>
  )
}
