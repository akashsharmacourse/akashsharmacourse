import { CheckCircle, Mail, Users, BookOpen } from 'lucide-react'
import { courseSuccessData } from '../../data/data.js'
import { useInView } from '../../hooks/useInView'
import styles from './CourseSuccess.module.css'

const iconMap = { Mail, Users, BookOpen }

export default function CourseSuccess() {
  const [ref, inView] = useInView(0.1)

  return (
    <main className={styles.page}>
      <div
        className={`${styles.container} ${inView ? styles.visible : ''}`}
        ref={ref}
      >
        {/* Success icon */}
        <div className={styles.iconWrap}>
          <CheckCircle size={56} className={styles.icon} />
        </div>

        <span className={styles.badge}>{courseSuccessData.badge}</span>
        <h1 className={styles.heading}>{courseSuccessData.heading}</h1>
        <p className={styles.subheading}>{courseSuccessData.subheading}</p>

        {/* Steps */}
        <div className={styles.steps}>
          {courseSuccessData.steps.map((step, i) => {
            const Icon = iconMap[step.icon]
            return (
              <div key={i} className={styles.step} style={{ '--i': i }}>
                <div className={styles.stepIcon}>
                  {Icon && <Icon size={20} />}
                </div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTAs */}
        <div className={styles.actions}>
          <a
            href={courseSuccessData.whatsappLink}
            className={styles.btnSecondary}
            target="_blank"
            rel="noopener noreferrer"
          >
            {courseSuccessData.whatsappCta}
          </a>
          <a
            href={courseSuccessData.loginLink}
            className={styles.btnPrimary}
          >
            {courseSuccessData.loginCta}
          </a>
        </div>

        <p className={styles.note}>{courseSuccessData.note}</p>
      </div>
    </main>
  )
}
