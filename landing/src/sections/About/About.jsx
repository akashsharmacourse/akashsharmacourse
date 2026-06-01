import { aboutData } from '../../data/data.js'
import styles from './About.module.css'
import { useInView } from '../../hooks/useInView'

export default function About() {
  const [ref, inView] = useInView()

  return (
    <section id="about" className={`${styles.about} ${inView ? styles.visible : ''}`} ref={ref}>
      <div className={styles.container}>

        {/* LEFT — Image */}
        <div className={styles.imageWrap}>
          <img
            src={aboutData.image}
            alt={aboutData.imageAlt}
            className={styles.image}
            loading="lazy"
          />
        </div>

        {/* RIGHT — Content */}
        <div className={styles.content}>
          <span className={styles.badge}>{aboutData.badge}</span>
          <h2 className={styles.name}>{aboutData.name}</h2>
          <p className={styles.title}>{aboutData.title}</p>
          <p className={styles.bio}>{aboutData.bio}</p>

          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            {aboutData.stats.map((stat, i) => (
              <div
                key={i}
                className={styles.statCard}
                style={{ '--i': i }}
              >
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

