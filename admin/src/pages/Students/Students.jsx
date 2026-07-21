import { useEffect, useState } from 'react'
import {
  collection, getDocs, doc, updateDoc, deleteDoc
} from 'firebase/firestore'
import { db } from '../../config/firebase.js'
import { Users, Mail, Phone, BookOpen, Trash2, Award, Calendar, AlertCircle, Clock } from 'lucide-react'
import Modal from '../../components/Modal/Modal.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import styles from './Students.module.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

export default function Students() {
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  // Enrollment Modal states
  const [enrollModalOpen, setEnrollModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [enrollForm, setEnrollForm] = useState({}) // { [courseId]: boolean }

  // Deletion States
  const [deleteStudentId, setDeleteStudentId] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch all students
      const usersSnap = await getDocs(collection(db, 'users'))
      setStudents(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })))

      // Fetch all courses for enrollment selector
      const coursesSnap = await getDocs(collection(db, 'courses'))
      setCourses(coursesSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error('Fetch students error:', err)
    }
    setLoading(false)
  }

  const openEnrollment = (student) => {
    setSelectedStudent(student)
    // Build initial checklist mapping courseId to boolean check status
    const initialChecked = {}
    courses.forEach(course => {
      const isEnrolled = student.enrolledCourses?.some(c => c.id === course.id)
      initialChecked[course.id] = !!isEnrolled
    })
    setEnrollForm(initialChecked)
    setEnrollModalOpen(true)
  }

  const handleSaveEnrollments = async () => {
    if (!selectedStudent) return
    setSaving(true)
    try {
      // Build new enrolledCourses array
      const newEnrolledCourses = []
      courses.forEach(course => {
        if (enrollForm[course.id]) {
          // Find original progress if they were already enrolled, else default 0
          const original = selectedStudent.enrolledCourses?.find(c => c.id === course.id)
          newEnrolledCourses.push({
            id: course.id,
            title: course.title,
            description: course.description || '',
            progress: original ? original.progress || 0 : 0
          })
        }
      })

      // Calculate new aggregate progress (average)
      let overallProgress = 0
      if (newEnrolledCourses.length > 0) {
        const sum = newEnrolledCourses.reduce((s, c) => s + (c.progress || 0), 0)
        overallProgress = Math.round(sum / newEnrolledCourses.length)
      }

      await updateDoc(doc(db, 'users', selectedStudent.id), {
        enrolledCourses: newEnrolledCourses,
        progress: overallProgress
      })

      setEnrollModalOpen(false)
      fetchData()
    } catch (err) {
      console.error('Update student enrollments error:', err)
    }
    setSaving(false)
  }

  const handleDeleteStudent = async () => {
    if (!deleteStudentId) return
    try {
      // Delete from Firebase Auth via backend
      await fetch(`${BACKEND_URL}/api/auth/user/${deleteStudentId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET,
        },
      })
      console.log('Auth user deleted')
    } catch (err) {
      console.error('Auth delete error:', err)
    }

    try {
      await deleteDoc(doc(db, 'users', deleteStudentId))
      setDeleteStudentId(null)
      fetchData()
    } catch (err) {
      console.error('Delete student error:', err)
    }
  }

  const handleCheckboxChange = (courseId) => {
    setEnrollForm(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }))
  }

  const toggleAccess = async (student) => {
    try {
      await updateDoc(doc(db, 'users', student.id), {
        hasAccess: student.hasAccess === false ? true : false
      })
      fetchData()
    } catch (err) {
      console.error('Toggle access error:', err)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.heading}>Students Registry</h2>
          <p className={styles.sub}>{students.length} registered students</p>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading students database...</div>
      ) : students.length > 0 ? (
        <div className={styles.grid}>
          {students.map((student) => {
            const enrolledList = student.enrolledCourses || []
            const completedCount = student.completedChapters?.length || 0

            return (
              <div key={student.id} className={styles.card}>
                {/* Header with avatar */}
                <div className={styles.cardHeader}>
                  <div className={styles.avatar}>
                    {student.name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div className={styles.meta}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h3 className={styles.name}>{student.name || 'Student'}</h3>
                      <span className={`${styles.accessBadge} ${student.hasAccess !== false ? styles.active : styles.inactive}`}>
                        {student.hasAccess !== false ? 'Active' : 'Revoked'}
                      </span>
                    </div>
                    <span className={styles.email}>
                      <Mail size={12} />
                      {student.email || 'No email'}
                    </span>
                  </div>
                </div>

                {/* Details info */}
                <div className={styles.details}>
                  {student.phone && (
                    <div className={styles.detailItem}>
                      <Phone size={13} className={styles.detailIcon} />
                      <span>{student.phone}</span>
                    </div>
                  )}
                  <div className={styles.detailItem}>
                    <Calendar size={13} className={styles.detailIcon} />
                    <span className={styles.dateText}>
                      Joined: {student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-IN') : '—'}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <Clock size={13} className={styles.detailIcon} />
                    <span className={styles.dateText}>
                      Expires: {student.accessExpiresAt
                        ? new Date(student.accessExpiresAt).toLocaleDateString('en-IN')
                        : 'Never'}
                    </span>
                  </div>
                </div>

                {/* Course indicators */}
                <div className={styles.coursesSection}>
                  <div className={styles.coursesHeader}>
                    <BookOpen size={14} className={styles.coursesIcon} />
                    <span className={styles.coursesLabel}>
                      Enrolled Courses ({enrolledList.length})
                    </span>
                  </div>
                  {enrolledList.length > 0 ? (
                    <div className={styles.tagsList}>
                      {enrolledList.map((c, idx) => (
                        <span key={idx} className={styles.courseTag} title={c.title}>
                          {c.title} ({c.progress || 0}%)
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.noCourses}>No courses enrolled.</div>
                  )}
                </div>

                {/* Completed chapters total */}
                <div className={styles.achievements}>
                  <Award size={14} className={styles.completedIcon} />
                  <span>{completedCount} Completed Lessons</span>
                </div>

                {/* Actions footer */}
                <div className={styles.cardActions}>
                  <button
                    className={styles.enrollBtn}
                    onClick={() => openEnrollment(student)}
                  >
                    Manage Courses
                  </button>
                  <button
                    className={styles.accessBtn}
                    onClick={() => toggleAccess(student)}
                    title={student.hasAccess === false ? 'Grant Access' : 'Revoke Access'}
                  >
                    {student.hasAccess === false ? 'Grant' : 'Revoke'}
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => setDeleteStudentId(student.id)}
                    title="Delete Student Profile"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className={styles.empty}>
          <Users size={48} className={styles.emptyIcon} />
          <h3>No Students Found</h3>
          <p>Once students register and log into the portal, they will appear here.</p>
        </div>
      )}

      {/* Manage Enrollments Modal */}
      <Modal
        isOpen={enrollModalOpen}
        onClose={() => setEnrollModalOpen(false)}
        title={`Enrollments: ${selectedStudent?.name || 'Student'}`}
        size="md"
      >
        <div className={styles.enrollForm}>
          <p className={styles.formDesc}>
            Check the courses you want to enroll this student in. Uncheck to unenroll.
          </p>

          {courses.length > 0 ? (
            <div className={styles.checklist}>
              {courses.map(course => (
                <label key={course.id} className={styles.checkItem}>
                  <input
                    type="checkbox"
                    checked={!!enrollForm[course.id]}
                    onChange={() => handleCheckboxChange(course.id)}
                    className={styles.checkbox}
                  />
                  <div className={styles.checkTexts}>
                    <span className={styles.checkTitle}>{course.title}</span>
                    <span className={styles.checkPrice}>₹{course.price?.toLocaleString('en-IN') || 0}</span>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className={styles.emptyChecklist}>
              <AlertCircle size={24} />
              <p>No courses available in catalog. Please create a course first.</p>
            </div>
          )}

          <div className={styles.modalActions}>
            <button className={styles.cancelBtn} onClick={() => setEnrollModalOpen(false)}>
              Cancel
            </button>
            <button
              className={styles.saveBtn}
              onClick={handleSaveEnrollments}
              disabled={saving || courses.length === 0}
            >
              {saving ? 'Updating...' : 'Save Enrollments'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Profile Confirm */}
      <ConfirmDialog
        isOpen={!!deleteStudentId}
        title="Delete Student Profile"
        message="Are you sure you want to delete this student profile? They will immediately lose dashboard access. This action cannot be undone."
        onConfirm={handleDeleteStudent}
        onCancel={() => setDeleteStudentId(null)}
      />
    </div>
  )
}
