import { useEffect, useState, useMemo } from 'react'
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../../config/firebase.js'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import styles from './Students.module.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET

export default function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [deleteId, setDeleteId] = useState(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [addModal, setAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', email: '', phone: '', accessDays: 30 })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')

  useEffect(() => { fetchStudents() }, [])

  const handleAddStudent = async () => {
    if (!addForm.name || !addForm.email || !addForm.phone) {
      setAddError('All fields required')
      return
    }
    setAddLoading(true)
    setAddError('')
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/add-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': ADMIN_SECRET,
        },
        body: JSON.stringify(addForm),
      })
      const data = await res.json()
      if (data.success) {
        setAddModal(false)
        setAddForm({ name: '', email: '', phone: '', accessDays: 30 })
        fetchStudents()
      } else {
        setAddError(data.error || 'Failed to add student')
      }
    } catch {
      setAddError('Something went wrong')
    }
    setAddLoading(false)
  }

  const fetchStudents = async () => {
    const snap = await getDocs(collection(db, 'users'))
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    setStudents(data)
    setLoading(false)
  }

  const getStatus = (s) => {
    if (s.hasAccess === false) return 'revoked'
    if (s.accessExpiresAt && new Date(s.accessExpiresAt) < new Date()) return 'expired'
    return 'active'
  }

  const filtered = useMemo(() => {
    let result = [...students]

    // Tab filter
    if (activeTab !== 'all') {
      result = result.filter(s => getStatus(s) === activeTab)
    }

    // Search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.phone?.includes(q)
      )
    }

    // Date range
    if (dateFrom) {
      result = result.filter(s =>
        s.createdAt && new Date(s.createdAt) >= new Date(dateFrom)
      )
    }
    if (dateTo) {
      result = result.filter(s =>
        s.createdAt && new Date(s.createdAt) <= new Date(dateTo + 'T23:59:59')
      )
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '')
      if (sortBy === 'expiry') return new Date(a.accessExpiresAt) - new Date(b.accessExpiresAt)
      return 0
    })

    return result
  }, [students, search, activeTab, sortBy, dateFrom, dateTo])

  // Stats
  const stats = useMemo(() => ({
    total: students.length,
    active: students.filter(s => getStatus(s) === 'active').length,
    expired: students.filter(s => getStatus(s) === 'expired').length,
    revoked: students.filter(s => getStatus(s) === 'revoked').length,
    revenue: students.reduce((sum, s) => sum + (s.paymentAmount || 0), 0),
  }), [students])

  const toggleAccess = async (s) => {
    const newAccess = s.hasAccess === false ? true : false
    await updateDoc(doc(db, 'users', s.id), { hasAccess: newAccess })
    fetchStudents()
  }

  const extendAccess = async (s) => {
    const current = s.accessExpiresAt ? new Date(s.accessExpiresAt) : new Date()
    const extended = new Date(Math.max(current, new Date()))
    extended.setDate(extended.getDate() + 30)
    await updateDoc(doc(db, 'users', s.id), {
      accessExpiresAt: extended.toISOString(),
      hasAccess: true,
    })
    fetchStudents()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await fetch(`${BACKEND_URL}/api/auth/user/${deleteId}`, {
        method: 'DELETE',
        headers: { 'x-admin-secret': ADMIN_SECRET },
      })
    } catch {}
    await deleteDoc(doc(db, 'users', deleteId))
    setDeleteId(null)
    fetchStudents()
  }

  const tabs = [
    { key: 'all', label: 'All', count: stats.total },
    { key: 'active', label: 'Active ✅', count: stats.active },
    { key: 'expired', label: 'Expired ⚠️', count: stats.expired },
    { key: 'revoked', label: 'Revoked ❌', count: stats.revoked },
  ]

  const statusConfig = {
    active: { label: 'Active', cls: styles.active },
    expired: { label: 'Expired', cls: styles.expired },
    revoked: { label: 'Revoked', cls: styles.revoked },
  }

  if (loading) return <div className={styles.loading}>Loading students...</div>

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.heading}>Students</h2>
          <p className={styles.sub}>{stats.total} total enrolled</p>
        </div>
        <button className={styles.addBtn} onClick={() => setAddModal(true)}>
          + Add Student
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {[
          { label: 'Total', value: stats.total, cls: '' },
          { label: 'Active', value: stats.active, cls: styles.statActive },
          { label: 'Expired', value: stats.expired, cls: styles.statExpired },
          { label: 'Revoked', value: stats.revoked, cls: styles.statRevoked },
          { label: 'Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, cls: '' },
        ].map((s, i) => (
          <div key={i} className={styles.statCard}>
            <div className={`${styles.statValue} ${s.cls}`}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map(t => (
          <button
            key={t.key}
            className={`${styles.tab} ${activeTab === t.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
            <span className={styles.tabCount}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search name, email, phone..."
          className={styles.searchInput}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className={styles.select}
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Name A-Z</option>
          <option value="expiry">Expiry Soon</option>
        </select>
        <input
          type="date"
          className={styles.dateInput}
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          placeholder="From date"
        />
        <input
          type="date"
          className={styles.dateInput}
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          placeholder="To date"
        />
        {(dateFrom || dateTo || search) && (
          <button
            className={styles.clearBtn}
            onClick={() => { setSearch(''); setDateFrom(''); setDateTo('') }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Results count */}
      <p className={styles.resultsCount}>
        Showing {filtered.length} of {students.length} students
      </p>

      {/* Desktop Table */}
      <div className={styles.tableWrap}>
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Student</span>
            <span>Phone</span>
            <span>Enrolled</span>
            <span>Expires</span>
            <span>Lessons</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {filtered.length > 0 ? filtered.map(s => {
            const status = getStatus(s)
            const cfg = statusConfig[status]
            const daysLeft = s.accessExpiresAt
              ? Math.ceil((new Date(s.accessExpiresAt) - new Date()) / (1000 * 60 * 60 * 24))
              : null

            return (
              <div key={s.id} className={styles.tableRow}>
                {/* Student info */}
                <div className={styles.studentInfo}>
                  <div className={styles.avatar}>
                    {s.name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div>
                    <div className={styles.studentName}>
                      {s.name || '—'}
                      {(s.enrolledCourseId || s.enrolledCourses?.length > 0) && (
                        <span className={styles.enrolledBadge}>1 enrolled</span>
                      )}
                    </div>
                    <div className={styles.studentEmail}>{s.email || '—'}</div>
                  </div>
                </div>

                <span className={styles.phone}>{s.phone || '—'}</span>

                <span className={styles.date}>
                  {s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN') : '—'}
                </span>

                <div>
                  <span className={styles.date}>
                    {s.accessExpiresAt ? new Date(s.accessExpiresAt).toLocaleDateString('en-IN') : '—'}
                  </span>
                  {daysLeft !== null && status === 'active' && (
                    <span className={`${styles.daysLeft} ${daysLeft <= 7 ? styles.daysWarning : ''}`}>
                      {daysLeft > 0 ? `${daysLeft}d left` : 'Today'}
                    </span>
                  )}
                </div>

                <span className={styles.lessons}>
                  {new Set(s.completedChapters || []).size}
                </span>

                <span className={styles.amount}>
                  {s.paymentAmount ? `₹${s.paymentAmount.toLocaleString('en-IN')}` : '—'}
                </span>

                <span className={`${styles.badge} ${cfg.cls}`}>
                  {cfg.label}
                </span>

                <div className={styles.actions}>
                  {/* Grant/Revoke */}
                  <button
                    className={`${styles.actionBtn} ${status !== 'revoked' ? styles.revokeBtn : styles.grantBtn}`}
                    onClick={() => toggleAccess(s)}
                    title={status !== 'revoked' ? 'Revoke Access' : 'Grant Access'}
                  >
                    {status !== 'revoked' ? 'Revoke' : 'Grant'}
                  </button>

                  {/* Extend +30 days */}
                  <button
                    className={`${styles.actionBtn} ${styles.extendBtn}`}
                    onClick={() => extendAccess(s)}
                    title="Extend +30 days"
                  >
                    +30d
                  </button>

                  {/* Delete */}
                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => setDeleteId(s.id)}
                    title="Delete Student"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          }) : (
            <div className={styles.emptyRow}>No students found.</div>
          )}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className={styles.mobileCards}>
        {filtered.length > 0 ? filtered.map(s => {
          const status = getStatus(s)
          const cfg = statusConfig[status]
          const daysLeft = s.accessExpiresAt
            ? Math.ceil((new Date(s.accessExpiresAt) - new Date()) / (1000 * 60 * 60 * 24))
            : null

          return (
            <div key={s.id} className={styles.mobileCard}>
              <div className={styles.mobileCardTop}>
                <div className={styles.studentInfo}>
                  <div className={styles.avatar}>
                    {s.name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div>
                    <div className={styles.studentName}>
                      {s.name || '—'}
                      {(s.enrolledCourseId || s.enrolledCourses?.length > 0) && (
                        <span className={styles.enrolledBadge}>1 enrolled</span>
                      )}
                    </div>
                    <div className={styles.studentEmail}>{s.email || '—'}</div>
                  </div>
                </div>
                <span className={`${styles.badge} ${cfg.cls}`}>{cfg.label}</span>
              </div>

              <div className={styles.mobileCardDetails}>
                <div className={styles.detailRow}>
                  <span>Phone</span><span>{s.phone || '—'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span>Joined</span>
                  <span>{s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN') : '—'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span>Expires</span>
                  <span>
                    {s.accessExpiresAt ? new Date(s.accessExpiresAt).toLocaleDateString('en-IN') : '—'}
                    {daysLeft !== null && status === 'active' && (
                      <span className={`${styles.daysLeft} ${daysLeft <= 7 ? styles.daysWarning : ''}`}>
                        {' '}({daysLeft}d left)
                      </span>
                    )}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span>Lessons</span>
                  <span>{new Set(s.completedChapters || []).size}</span>
                </div>
                <div className={styles.detailRow}>
                  <span>Amount</span>
                  <span>{s.paymentAmount ? `₹${s.paymentAmount.toLocaleString('en-IN')}` : '—'}</span>
                </div>
              </div>

              <div className={styles.mobileCardActions}>
                <button
                  className={`${styles.actionBtn} ${status !== 'revoked' ? styles.revokeBtn : styles.grantBtn}`}
                  onClick={() => toggleAccess(s)}
                >
                  {status !== 'revoked' ? 'Revoke' : 'Grant'}
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.extendBtn}`}
                  onClick={() => extendAccess(s)}
                >
                  +30 Days
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  onClick={() => setDeleteId(s.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          )
        }) : (
          <div className={styles.emptyRow}>No students found.</div>
        )}
      </div>

      {addModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Add Student Manually</h3>
            {addError && <p className={styles.errorMsg}>{addError}</p>}
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Full Name *</label>
                <input
                  className={styles.input}
                  value={addForm.name}
                  onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Student name"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email *</label>
                <input
                  className={styles.input}
                  type="email"
                  value={addForm.email}
                  onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="student@email.com"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Phone *</label>
                <input
                  className={styles.input}
                  value={addForm.phone}
                  onChange={e => setAddForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="10-digit number"
                  maxLength={10}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Access Days (default 30)</label>
                <input
                  className={styles.input}
                  type="number"
                  value={addForm.accessDays}
                  onChange={e => setAddForm(p => ({ ...p, accessDays: Number(e.target.value) }))}
                  min={1}
                  max={365}
                />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => { setAddModal(false); setAddError('') }}
              >
                Cancel
              </button>
              <button
                className={styles.saveBtn}
                onClick={handleAddStudent}
                disabled={addLoading}
              >
                {addLoading ? 'Adding...' : 'Add Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Student"
        message="This will permanently delete this student's account and all data."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
