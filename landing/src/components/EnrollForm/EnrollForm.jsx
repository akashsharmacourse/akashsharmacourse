import { useState } from 'react'
import { Shield, Lock } from 'lucide-react'
import { formData } from '../../data/data.js'
import styles from './EnrollForm.module.css'

export default function EnrollForm({ type = 'course', onSubmit, loading: externalLoading }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [internalLoading, setInternalLoading] = useState(false)
  const loading = externalLoading || internalLoading

  const info = type === 'course' ? formData.course : formData.oneOnOne

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    else if (!/^\d{10}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit number'
    return e
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setInternalLoading(true)
    await onSubmit(form)
    setInternalLoading(false)
  }

  return (
    <div className={styles.wrap}>
      {/* Order summary */}
      <div className={styles.summary}>
        <span className={styles.summaryLabel}>{info.heading}</span>
        <div className={styles.priceRow}>
          <span className={styles.originalPrice}>{info.originalPrice}</span>
          <span className={styles.currentPrice}>{info.price}</span>
        </div>
      </div>

      {/* Form */}
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <h3 className={styles.formHeading}>{formData.heading}</h3>
        <p className={styles.formSub}>{formData.subheading}</p>

        {/* Name */}
        <div className={styles.field}>
          <label className={styles.label}>
            {formData.fields.name.label}
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder={formData.fields.name.placeholder}
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            autoComplete="name"
          />
          {errors.name && <span className={styles.error}>{errors.name}</span>}
        </div>

        {/* Email */}
        <div className={styles.field}>
          <label className={styles.label}>
            {formData.fields.email.label}
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder={formData.fields.email.placeholder}
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            autoComplete="email"
          />
          {errors.email && <span className={styles.error}>{errors.email}</span>}
        </div>

        {/* Phone */}
        <div className={styles.field}>
          <label className={styles.label}>
            {formData.fields.phone.label}
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder={formData.fields.phone.placeholder}
            className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
            autoComplete="tel"
            maxLength={10}
          />
          {errors.phone && <span className={styles.error}>{errors.phone}</span>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading}
        >
          {loading ? (
            <span className={styles.spinner} />
          ) : (
            <>
              <Lock size={16} />
              {formData.cta}
            </>
          )}
        </button>

        {/* Trust note */}
        <div className={styles.trustRow}>
          <Shield size={14} />
          <span>{formData.note}</span>
        </div>
      </form>
    </div>
  )
}
