import React from 'react';
import { heroData } from '../../data/data.js';
import { useInView } from '../../hooks/useInView';
import { useCountUp } from '../../hooks/useCountUp';
import { Play as PlayIcon, TrendingUp as BadgeIcon } from 'lucide-react';
import styles from './Hero.module.css';

function StatItem({ stat, inView, index }) {
  const count = useCountUp(stat.value, 2000, inView);
  return (
    <div
      className={styles.statItem}
      style={{ '--i': index }}
    >
      <span className={styles.statValue}>
        {count.toLocaleString()}{stat.suffix}
      </span>
      <span className={styles.statLabel}>{stat.label}</span>
    </div>
  );
}

export function Hero() {
  const [ref, inView] = useInView(0.05);

  return (
    <section 
      id="hero" 
      ref={ref}
      className={`${styles.hero} ${inView ? styles.visible : ''}`}
      aria-label="Akash Sharma Stock Market Coach Hero"
    >
      <div className={styles.gridOverlay}></div>
      <div className={styles.radialGlow}></div>

      <div className={styles.container}>
        <span className={styles.badge}>
          <BadgeIcon size={8} /> 10+ YEARS OF PROFITABLE TRADING
        </span>

        <h1 className={styles.headline}>
          <span className={styles.headlineWhite}>Master the Stock Market.</span>
          <span className={styles.headlineAccent}>Trade With Precision.</span>
        </h1>

        <div className={styles.videoCard}>
          <div className={styles.playButton}>
            <PlayIcon size={32} />
          </div>
          <span className={styles.videoLabel}>Introduction by Akash Sir</span>
        </div>

        <p className={styles.subheadline}>
          {heroData.subheadline}
        </p>

        <div className={styles.buttons}>
          <a href="/enroll" className={styles.btnPrimary}>{heroData.ctaPrimary}</a>
          <a href="#results" className={styles.btnSecondary}>{heroData.ctaSecondary}</a>
        </div>

        <div className={`${styles.stats} ${inView ? styles.visible : ''}`}>
          {heroData.stats.map((stat, i) => (
            <StatItem key={i} stat={stat} inView={inView} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default React.memo(Hero);

