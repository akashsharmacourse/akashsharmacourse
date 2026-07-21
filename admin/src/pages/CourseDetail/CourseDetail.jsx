import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase.js'
import {
  ChevronLeft, Plus, Trash2, Video, FileText,
  ChevronDown, ChevronUp, AlertCircle, Edit, Play, Pencil
} from 'lucide-react'
import Modal from '../../components/Modal/Modal.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import styles from './CourseDetail.module.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const uploadToCloudinary = async (file, resourceType = 'video') => {
  try {
    console.log('Starting upload:', file.name, 'type:', resourceType)

    // Get signature
    const signRes = await fetch(`${BACKEND_URL}/api/upload/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET,
      },
      body: JSON.stringify({
        folder: 'courses',
        resource_type: resourceType === 'pdf' ? 'raw' : resourceType,
      }),
    })
    const signData = await signRes.json()
    console.log('Sign response:', signData)

    if (!signData.success) {
      throw new Error('Sign failed: ' + JSON.stringify(signData))
    }

    // Upload to Cloudinary
    const formData = new FormData()
    formData.append('file', file)
    formData.append('signature', signData.signature)
    formData.append('timestamp', signData.timestamp)
    formData.append('api_key', signData.apiKey)
    formData.append('folder', signData.folder)

    const cloudinaryType = resourceType === 'pdf' ? 'raw' : resourceType

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${signData.cloudName}/${cloudinaryType}/upload`,
      { method: 'POST', body: formData }
    )
    const uploadData = await uploadRes.json()
    console.log('Cloudinary response:', uploadData)

    if (uploadData.error) {
      throw new Error('Cloudinary error: ' + uploadData.error.message)
    }

    if (!uploadData.public_id) {
      throw new Error('No public_id returned')
    }

    console.log('Upload success! public_id:', uploadData.public_id)
    return uploadData.public_id

  } catch (err) {
    console.error('Upload error:', err)
    throw err
  }
}


export default function CourseDetail() {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)

  // Accordion state
  const [openChapters, setOpenChapters] = useState({})

  // Chapter Modal
  const [chapterModalOpen, setChapterModalOpen] = useState(false)
  const [chapterForm, setChapterForm] = useState({ title: '' })

  // Lesson Modal
  const [lessonModalOpen, setLessonModalOpen] = useState(false)
  const [activeChapterId, setActiveChapterId] = useState(null)
  
  // videoForm State
  const [videoForm, setVideoForm] = useState({
    title: '',
    videoFile: null,  // File object
    pdfFile: null,    // File object
    duration: '',
  })
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  // Edit states
  const [editChapterModal, setEditChapterModal] = useState(false)
  const [editVideoModal, setEditVideoModal] = useState(false)
  const [editChapterIdx, setEditChapterIdx] = useState(null)
  const [editVideoIdx, setEditVideoIdx] = useState(null)
  const [editChapterForm, setEditChapterForm] = useState({ title: '' })
  const [editVideoForm, setEditVideoForm] = useState({ title: '', duration: '' })

  // Deletion States
  const [deleteChapterId, setDeleteChapterId] = useState(null)
  const [deleteLessonInfo, setDeleteLessonInfo] = useState(null) // { chapterId, lessonId }

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCourseDetail()
  }, [courseId])

  const fetchCourseDetail = async () => {
    try {
      const docRef = doc(db, 'courses', courseId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        // Ensure chapters is always an array
        if (!data.chapters) data.chapters = []
        setCourse({ id: docSnap.id, ...data })

        // Open first chapter by default
        if (data.chapters.length > 0 && Object.keys(openChapters).length === 0) {
          setOpenChapters({ [data.chapters[0].id]: true })
        }
      }
    } catch (err) {
      console.error('Fetch course detail error:', err)
    }
    setLoading(false)
  }

  const toggleChapter = (chapterId) => {
    setOpenChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }))
  }

  // --- Chapter Actions ---
  const handleAddChapter = async () => {
    if (!chapterForm.title.trim()) return
    setSaving(true)
    try {
      const newChapter = {
        id: `chap_${Date.now()}`,
        title: chapterForm.title,
        videos: [] // updated from lessons to videos
      }
      const updatedChapters = [...(course.chapters || []), newChapter]

      await updateDoc(doc(db, 'courses', course.id), {
        chapters: updatedChapters
      })

      setChapterForm({ title: '' })
      setChapterModalOpen(false)
      fetchCourseDetail()
    } catch (err) {
      console.error('Add chapter error:', err)
    }
    setSaving(false)
  }

  const handleDeleteChapter = async () => {
    if (!deleteChapterId) return
    try {
      const updatedChapters = course.chapters.filter(c => c.id !== deleteChapterId)
      await updateDoc(doc(db, 'courses', course.id), {
        chapters: updatedChapters
      })
      setDeleteChapterId(null)
      fetchCourseDetail()
    } catch (err) {
      console.error('Delete chapter error:', err)
    }
  }

  // --- Edit Handlers ---
  const handleEditChapter = async () => {
    if (!editChapterForm.title.trim()) return
    setSaving(true)
    try {
      const chapters = [...(course.chapters || [])]
      chapters[editChapterIdx].title = editChapterForm.title
      await updateDoc(doc(db, 'courses', courseId), { chapters })
      setEditChapterModal(false)
      fetchCourseDetail()
    } catch (err) {
      console.error('Edit chapter error:', err)
    }
    setSaving(false)
  }

  const handleEditVideo = async () => {
    if (!editVideoForm.title.trim()) return
    setSaving(true)
    try {
      const chapters = [...(course.chapters || [])]
      chapters[editChapterIdx].videos[editVideoIdx].title = editVideoForm.title
      chapters[editChapterIdx].videos[editVideoIdx].duration = editVideoForm.duration
      await updateDoc(doc(db, 'courses', courseId), { chapters })
      setEditVideoModal(false)
      fetchCourseDetail()
    } catch (err) {
      console.error('Edit video error:', err)
    }
    setSaving(false)
  }

  // --- Lesson/Video Actions ---
  const openAddLesson = (chapterId) => {
    setActiveChapterId(chapterId)
    setVideoForm({ title: '', videoFile: null, pdfFile: null, duration: '' })
    setUploadProgress('')
    setLessonModalOpen(true)
  }

  const handleAddVideo = async () => {
    if (!videoForm.title.trim()) return
    setSaving(true)
    setUploading(true)

    try {
      // Upload video if exists
      let videoPublicId = ''
      if (videoForm.videoFile) {
        setUploadProgress('Uploading video...')
        videoPublicId = await uploadToCloudinary(videoForm.videoFile, 'video')
        console.log('Video uploaded:', videoPublicId)
      }

      // Upload PDF if exists
      let pdfPublicId = ''
      if (videoForm.pdfFile) {
        setUploadProgress('Uploading PDF...')
        pdfPublicId = await uploadToCloudinary(videoForm.pdfFile, 'raw')
        console.log('PDF uploaded:', pdfPublicId)
      }

      setUploadProgress('Saving to database...')
      const chapters = [...(course.chapters || [])]
      const activeChapterIdx = chapters.findIndex(chap => chap.id === activeChapterId)
      if (activeChapterIdx === -1) {
        throw new Error('Active chapter not found')
      }

      const newVideo = {
        id: `vid_${Date.now()}`,
        title: videoForm.title,
        videoUrl: videoPublicId || '',
        pdfUrl: pdfPublicId || '',
        duration: videoForm.duration || '',
        completed: false,
        createdAt: new Date().toISOString(),
      }
      
      chapters[activeChapterIdx].videos = [
        ...(chapters[activeChapterIdx].videos || []),
        newVideo,
      ]
      
      await updateDoc(doc(db, 'courses', courseId), { chapters })
      console.log('Saved to Firestore!')
      
      setLessonModalOpen(false)
      setVideoForm({ title: '', videoFile: null, pdfFile: null, duration: '' })
      setUploadProgress('')
      fetchCourseDetail()
    } catch (err) {
      console.error('Add video error:', err)
      setUploadProgress('Upload failed: ' + err.message)
    }
    setSaving(false)
    setUploading(false)
  }

  const handleDeleteLesson = async () => {
    if (!deleteLessonInfo) return
    const { chapterId, lessonId } = deleteLessonInfo
    try {
      const updatedChapters = course.chapters.map(chap => {
        if (chap.id === chapterId) {
          return {
            ...chap,
            videos: (chap.videos || []).filter(v => v.id !== lessonId)
          }
        }
        return chap
      })

      await updateDoc(doc(db, 'courses', course.id), {
        chapters: updatedChapters
      })

      setDeleteLessonInfo(null)
      fetchCourseDetail()
    } catch (err) {
      console.error('Delete video error:', err)
    }
  }

  if (loading) {
    return <div className={styles.loading}>Loading course structure...</div>
  }

  if (!course) {
    return (
      <div className={styles.error}>
        <AlertCircle size={40} className={styles.errorIcon} />
        <h3>Course Not Found</h3>
        <p>We could not find this course in the database.</p>
        <Link to="/courses" className={styles.backBtn}>Back to Courses</Link>
      </div>
    )
  }

  const totalLessons = course.chapters?.reduce((sum, ch) => sum + (ch.videos?.length || 0), 0) || 0

  return (
    <div className={styles.page}>
      {/* Header back row */}
      <div className={styles.topHeader}>
        <Link to="/courses" className={styles.backLink}>
          <ChevronLeft size={16} />
          <span>Back to Courses</span>
        </Link>
        <div className={styles.statusRow}>
          <span className={`${styles.statusBadge} ${course.published ? styles.published : styles.draft}`}>
            {course.published ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>

      <div className={styles.courseHeader}>
        <h2 className={styles.heading}>{course.title}</h2>
        <p className={styles.sub}>{course.description || 'No description provided.'}</p>
        <div className={styles.statsRow}>
          <span className={styles.statItem}>{course.chapters?.length || 0} Chapters</span>
          <span className={styles.statItem}>{totalLessons} Lessons</span>
          <span className={styles.priceItem}>Price: ₹{course.price?.toLocaleString('en-IN') || 0}</span>
        </div>
      </div>

      {/* Curriculum Manager Section */}
      <div className={styles.curriculumSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Syllabus & Modules</h3>
          <button className={styles.addBtn} onClick={() => setChapterModalOpen(true)}>
            <Plus size={16} />
            Add Chapter
          </button>
        </div>

        {course.chapters?.length > 0 ? (
          <div className={styles.chaptersList}>
            {course.chapters.map((chapter, ci) => {
              const isOpen = !!openChapters[chapter.id]
              return (
                <div key={chapter.id} className={styles.chapterGroup}>
                  {/* Chapter header panel */}
                  <div className={styles.chapterHeader}>
                    <button
                      className={styles.chapterTrigger}
                      onClick={() => toggleChapter(chapter.id)}
                    >
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      <span className={styles.chapterTitle}>{chapter.title}</span>
                      <span className={styles.lessonCount}>
                        {chapter.videos?.length || 0} videos
                      </span>
                    </button>
                    <div className={styles.chapterActions}>
                      <button
                        className={styles.addLessonBtn}
                        onClick={() => openAddLesson(chapter.id)}
                        title="Add Video"
                      >
                        <Plus size={14} /> Lesson
                      </button>
                      <button
                        className={styles.editChapterBtn}
                        onClick={() => {
                          setEditChapterIdx(ci)
                          setEditChapterForm({ title: chapter.title })
                          setEditChapterModal(true)
                        }}
                        title="Edit Chapter"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className={styles.trashBtn}
                        onClick={() => setDeleteChapterId(chapter.id)}
                        title="Delete Chapter"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Chapter lessons list */}
                  {isOpen && (
                    <div className={styles.lessonsContainer}>
                      {chapter.videos?.length > 0 ? (
                        chapter.videos.map((video, vi) => {
                          return (
                            <div key={video.id} className={styles.lessonItem}>
                              <div className={styles.lessonLeft}>
                                {video.pdfUrl && !video.videoUrl ? (
                                  <FileText size={16} className={styles.lessonIcon} />
                                ) : (
                                  <Video size={16} className={styles.lessonIcon} />
                                )}
                                <span className={styles.lessonTitle}>{video.title}</span>
                                {video.duration && (
                                  <span className={styles.durationTag}>{video.duration}</span>
                                )}
                              </div>
                              <div className={styles.lessonRight}>
                                {video.pdfUrl && (
                                  <span className={styles.typeBadge} style={{ background: 'var(--accent-dim)', color: 'var(--accent)', marginRight: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <FileText size={12} /> PDF
                                  </span>
                                )}
                                <span className={styles.typeBadge}>Video</span>
                                <button
                                  className={styles.editVideoBtn}
                                  onClick={() => {
                                    setEditChapterIdx(ci)
                                    setEditVideoIdx(vi)
                                    setEditVideoForm({
                                      title: video.title,
                                      duration: video.duration || ''
                                    })
                                    setEditVideoModal(true)
                                  }}
                                  title="Edit Video"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  className={styles.lessonTrashBtn}
                                  onClick={() => setDeleteLessonInfo({ chapterId: chapter.id, lessonId: video.id })}
                                  title="Delete Video"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className={styles.emptyLessons}>
                          No videos added in this chapter yet. Click "+ Lesson" above to add.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className={styles.emptyChapters}>
            <AlertCircle size={40} className={styles.emptyIcon} />
            <h4>No Syllabus Configured</h4>
            <p>Add your first chapter/module to begin building the curriculum.</p>
            <button className={styles.addBtn} onClick={() => setChapterModalOpen(true)}>
              <Plus size={16} /> Add Chapter
            </button>
          </div>
        )}
      </div>

      {/* Add Chapter Modal */}
      <Modal
        isOpen={chapterModalOpen}
        onClose={() => setChapterModalOpen(false)}
        title="Add Chapter Module"
      >
        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Chapter Title *</label>
            <input
              className={styles.input}
              value={chapterForm.title}
              onChange={e => setChapterForm({ title: e.target.value })}
              placeholder="e.g. Chapter 1: Foundations of Finance"
            />
          </div>
          <div className={styles.modalActions}>
            <button className={styles.cancelBtn} onClick={() => setChapterModalOpen(false)}>
              Cancel
            </button>
            <button className={styles.saveBtn} onClick={handleAddChapter} disabled={saving}>
              {saving ? 'Adding...' : 'Add Chapter'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Lesson Modal */}
      <Modal
        isOpen={lessonModalOpen}
        onClose={() => !uploading && setLessonModalOpen(false)}
        title="Add Secure Lesson"
      >
        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Lesson Title *</label>
            <input
              className={styles.input}
              value={videoForm.title}
              onChange={e => setVideoForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. 1.1 Support and Resistance Basics"
              disabled={uploading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Video File (MP4)</label>
            <input
              type="file"
              accept="video/mp4,video/*"
              className={styles.input}
              onChange={e => setVideoForm(p => ({ ...p, videoFile: e.target.files[0] }))}
              disabled={uploading}
            />
            {videoForm.videoFile && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Selected: {videoForm.videoFile.name}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>PDF Material (optional)</label>
            <input
              type="file"
              accept="application/pdf,.pdf"
              className={styles.input}
              onChange={e => {
                const file = e.target.files[0]
                if (file) {
                  console.log('PDF selected:', file.name, file.type, file.size)
                  setVideoForm(p => ({ ...p, pdfFile: file }))
                }
              }}
              disabled={uploading}
            />
            {videoForm.pdfFile && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Selected: {videoForm.pdfFile.name}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Duration (MM:SS)</label>
            <input
              className={styles.input}
              value={videoForm.duration}
              onChange={e => setVideoForm(p => ({ ...p, duration: e.target.value }))}
              placeholder="e.g. 12:45"
              disabled={uploading}
            />
          </div>

          {uploadProgress && (
            <div style={{
              padding: '10px 14px',
              background: 'var(--accent-dim)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13,
              color: 'var(--accent)',
            }}>
              {uploadProgress}
            </div>
          )}

          <div className={styles.modalActions}>
            <button className={styles.cancelBtn} onClick={() => setLessonModalOpen(false)} disabled={uploading}>
              Cancel
            </button>
            <button className={styles.saveBtn} onClick={handleAddVideo} disabled={saving || uploading}>
              {uploading ? 'Uploading...' : 'Add Lesson'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Chapter Modal */}
      <Modal
        isOpen={editChapterModal}
        onClose={() => setEditChapterModal(false)}
        title="Edit Chapter"
        size="sm"
      >
        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Chapter Title *</label>
            <input
              className={styles.input}
              value={editChapterForm.title}
              onChange={e => setEditChapterForm({ title: e.target.value })}
              autoFocus
            />
          </div>
          <div className={styles.modalActions}>
            <button className={styles.cancelBtn} onClick={() => setEditChapterModal(false)}>
              Cancel
            </button>
            <button className={styles.saveBtn} onClick={handleEditChapter} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Video Modal */}
      <Modal
        isOpen={editVideoModal}
        onClose={() => setEditVideoModal(false)}
        title="Edit Video"
        size="md"
      >
        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Video Title *</label>
            <input
              className={styles.input}
              value={editVideoForm.title}
              onChange={e => setEditVideoForm(p => ({ ...p, title: e.target.value }))}
              autoFocus
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Duration (MM:SS)</label>
            <input
              className={styles.input}
              value={editVideoForm.duration}
              onChange={e => setEditVideoForm(p => ({ ...p, duration: e.target.value }))}
              placeholder="e.g. 12:30"
            />
          </div>
          <div className={styles.modalActions}>
            <button className={styles.cancelBtn} onClick={() => setEditVideoModal(false)}>
              Cancel
            </button>
            <button className={styles.saveBtn} onClick={handleEditVideo} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Chapter Confirm */}
      <ConfirmDialog
        isOpen={!!deleteChapterId}
        title="Delete Chapter"
        message="Are you sure you want to delete this chapter and all of its lessons? This action cannot be undone."
        onConfirm={handleDeleteChapter}
        onCancel={() => setDeleteChapterId(null)}
      />

      {/* Delete Lesson Confirm */}
      <ConfirmDialog
        isOpen={!!deleteLessonInfo}
        title="Delete Lesson"
        message="Are you sure you want to delete this lesson? This action cannot be undone."
        onConfirm={handleDeleteLesson}
        onCancel={() => setDeleteLessonInfo(null)}
      />
    </div>
  )
}
