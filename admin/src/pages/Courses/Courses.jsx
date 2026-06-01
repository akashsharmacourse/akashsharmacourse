import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection, getDocs, addDoc, deleteDoc,
  doc, updateDoc
} from 'firebase/firestore'
import { db } from '../../config/firebase.js'
import { Plus, Pencil, Trash2, Eye, EyeOff, BookOpen } from 'lucide-react'
import Modal from '../../components/Modal/Modal.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import styles from './Courses.module.css'

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editCourse, setEditCourse] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', price: '' })
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { fetchCourses() }, [])

  const fetchCourses = async () => {
    try {
      const snap = await getDocs(collection(db, 'courses'))
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error('Fetch courses error:', err)
    }
    setLoading(false)
  }

  const openCreate = () => {
    setEditCourse(null)
    setForm({ title: '', description: '', price: '' })
    setModalOpen(true)
  }

  const openEdit = (course) => {
    setEditCourse(course)
    setForm({ title: course.title, description: course.description, price: course.price })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      if (editCourse) {
        await updateDoc(doc(db, 'courses', editCourse.id), {
          title: form.title,
          description: form.description,
          price: Number(form.price),
          updatedAt: new Date().toISOString(),
        })
      } else {
        await addDoc(collection(db, 'courses'), {
          title: form.title,
          description: form.description,
          price: Number(form.price),
          published: false,
          chapters: [],
          createdAt: new Date().toISOString(),
        })
      }
      setModalOpen(false)
      fetchCourses()
    } catch (err) {
      console.error('Save course error:', err)
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteDoc(doc(db, 'courses', deleteId))
      setDeleteId(null)
      fetchCourses()
    } catch (err) {
      console.error('Delete course error:', err)
    }
  }

  const togglePublish = async (course) => {
    try {
      await updateDoc(doc(db, 'courses', course.id), {
        published: !course.published
      })
      fetchCourses()
    } catch (err) {
      console.error('Toggle publish error:', err)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.heading}>Courses</h2>
          <p className={styles.sub}>{courses.length} courses total</p>
        </div>
        <button className={styles.createBtn} onClick={openCreate}>
          <Plus size={16} />
          Create Course
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : courses.length > 0 ? (
        <div className={styles.grid}>
          {courses.map(course => (
            <div key={course.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.courseIcon}>
                  <BookOpen size={24} />
                </div>
                <span className={`${styles.statusBadge} ${course.published ? styles.published : styles.draft}`}>
                  {course.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <h3 className={styles.courseTitle}>{course.title}</h3>
              <p className={styles.courseDesc}>{course.description}</p>
              <div className={styles.courseMeta}>
                <span className={styles.price}>₹{course.price?.toLocaleString('en-IN') || 0}</span>
                <span className={styles.chapters}>
                  {course.chapters?.length || 0} chapters
                </span>
              </div>
              <div className={styles.cardActions}>
                <button
                  className={styles.viewBtn}
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <Eye size={14} /> Manage
                </button>
                <button
                  className={styles.editBtn}
                  onClick={() => openEdit(course)}
                >
                  <Pencil size={14} />
                </button>
                <button
                  className={styles.publishBtn}
                  onClick={() => togglePublish(course)}
                  title={course.published ? 'Unpublish' : 'Publish'}
                >
                  {course.published ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => setDeleteId(course.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <BookOpen size={48} className={styles.emptyIcon} />
          <h3>No Courses Yet</h3>
          <p>Create your first course to get started.</p>
          <button className={styles.createBtn} onClick={openCreate}>
            <Plus size={16} /> Create Course
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editCourse ? 'Edit Course' : 'Create Course'}
      >
        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Course Title *</label>
            <input
              className={styles.input}
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Stock Market Mastery"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Course description..."
              rows={3}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Price (₹)</label>
            <input
              className={styles.input}
              type="number"
              value={form.price}
              onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
              placeholder="9999"
            />
          </div>
          <div className={styles.modalActions}>
            <button className={styles.cancelBtn} onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editCourse ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
