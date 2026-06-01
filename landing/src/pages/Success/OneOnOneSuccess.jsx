import { CheckCircle, Calendar, Mail, MessageCircle } from 'lucide-react'
import { oneOnOneSuccessData } from '../../data/data.js'
import { useInView } from '../../hooks/useInView'
import styles from './OneOnOneSuccess.module.css'

const iconMap = { Calendar, Mail, MessageCircle }

export default function OneOnOneSuccess() {
  const [ref, inView] = useInView(0.1)

  return (
    <main className={styles.page}>
      <div
        className={`${styles.container} ${inView ? styles.visible : ''}`}
        ref={ref}
      >
        <div className={styles.iconWrap}>
          <CheckCircle size={56} className={styles.icon} />
        </div>

        <span className={styles.badge}>{oneOnOneSuccessData.badge}</span>
        <h1 className={styles.heading}>{oneOnOneSuccessData.heading}</h1>
        <p className={styles.subheading}>{oneOnOneSuccessData.subheading}</p>

        {/* Steps */}
        <div className={styles.steps}>
          {oneOnOneSuccessData.steps.map((step, i) => {
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

        {/* Primary CTA — Calendly */}
        <a
          href={oneOnOneSuccessData.calendlyLink}
          className={styles.btnPrimary}
          target="_blank"
          rel="noopener noreferrer"
        >
          {oneOnOneSuccessData.calendlyCta}
        </a>

        <a
          href={oneOnOneSuccessData.whatsappLink}
          className={styles.btnSecondary}
          target="_blank"
          rel="noopener noreferrer"
        >
          {oneOnOneSuccessData.whatsappCta}
        </a>

        <p className={styles.note}>{oneOnOneSuccessData.note}</p>
      </div>
    </main>
  )
}
