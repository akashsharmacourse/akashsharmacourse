import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import styles from './Login.module.css'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, sessionError } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please enter email and password')
      return
    }
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError('Invalid email or password. Please try again.')
    }
    setLoading(false)
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoWrap}>
          <img
            src="https://res.cloudinary.com/df0gvretu/image/upload/v1781079526/logo_c0qnsv.png"
            alt="AskAkashSharma"
            className={styles.logo}
            onError={(e) => {
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              if (parent && !parent.querySelector(`.${styles.fallbackText}`)) {
                const text = document.createElement('span');
                text.className = styles.fallbackText;
                text.innerText = 'Ask Akash Sharma';
                parent.appendChild(text);
              }
            }}
          />
        </div>

        <h1 className={styles.heading}>Welcome Back</h1>
        <p className={styles.sub}>Login to access your course dashboard</p>

        {error && (
          <div className={styles.errorBox}>{error}</div>
        )}

        {sessionError && (
          <div className={styles.errorBox}>{sessionError}</div>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrap}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={styles.input}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={styles.input}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPass(!showPass)}
                aria-label="Toggle password"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? <span className={styles.spinner} /> : 'Login to Dashboard'}
          </button>
        </form>

        <p className={styles.helpText}>
          Having trouble? Contact us on{' '}
          <a href="https://wa.me/919650213917" className={styles.link} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        </p>
      </div>
    </main>
  )
}
