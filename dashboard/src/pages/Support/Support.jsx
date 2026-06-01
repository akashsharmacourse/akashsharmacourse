import { useState } from 'react'
import { MessageCircle, Mail, Phone, ChevronDown } from 'lucide-react'
import { supportData } from '../../data/data.js'
import styles from './Support.module.css'

const iconMap = { MessageCircle, Mail, Phone }

function FaqItem({ faq }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`${styles.faqItem} ${open ? styles.open : ''}`}>
      <button
        className={styles.faqTrigger}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{faq.q}</span>
        <ChevronDown size={16} className={styles.faqIcon} />
      </button>
      <div className={styles.faqAnswer}>
        <p>{faq.a}</p>
      </div>
    </div>
  )
}

export default function Support() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.heading}>{supportData.heading}</h2>
        <p className={styles.sub}>{supportData.subheading}</p>
      </div>

      {/* Contact options */}
      <div className={styles.optionsGrid}>
        {supportData.options.map((opt, i) => {
          const Icon = iconMap[opt.icon]
          return (
            <div key={i} className={styles.optionCard}>
              <div className={styles.optionIcon}>
                {Icon && <Icon size={22} />}
              </div>
              <h3 className={styles.optionTitle}>{opt.title}</h3>
              <p className={styles.optionDesc}>{opt.desc}</p>
              
              <a
                href={opt.href}
                className={styles.optionCta}
                target="_blank"
                rel="noopener noreferrer"
              >
                {opt.cta}
              </a>
            </div>
          )
        })}
      </div>

      {/* FAQ */}
      <div className={styles.faqSection}>
        <h3 className={styles.faqHeading}>Frequently Asked Questions</h3>
        <div className={styles.faqList}>
          {supportData.faq.map((item, i) => (
            <FaqItem key={i} faq={item} />
          ))}
        </div>
      </div>
    </div>
  )
}
