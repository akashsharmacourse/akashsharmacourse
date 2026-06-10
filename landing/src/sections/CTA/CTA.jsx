import React from 'react';
import { ctaData } from '../../data/data.js';
import { useInView } from '../../hooks/useInView';
import styles from './CTA.module.css';

export function CTA() {
  const [revealRef, isVisible] = useInView(0.15);

  return (
    <section 
      ref={revealRef}
      className={`${styles.section} ${isVisible ? styles.visible : ''}`}
      aria-label="Final enrollment call to action"
    >
      <div className={styles.radialGlow}></div>
      <div className={styles.gridOverlay}></div>

      <div className={`${styles.container} container`}>
        <div className={styles.content}>
          
          {/* Core headlines */}
          <h2 className={styles.heading} style={{ '--i': 1 }}>
            {ctaData.heading}
          </h2>

          <p className={styles.subheading} style={{ '--i': 2 }}>
            {ctaData.subheading}
          </p>

          {/* Urgency text line above button */}
          <div className={styles.urgencyText} style={{ '--i': 3 }}>
            ⚡ {ctaData.urgency}
          </div>

          {/* Actions button */}
          <div className={styles.actions} style={{ '--i': 4 }}>
            <a 
              href="/enroll" 
              className={styles.ctaBtn}
              aria-label="Enroll in stock market mastery programme now"
            >
              {ctaData.cta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default React.memo(CTA);
