import React from 'react';
import { trustStripData } from '../../data/data.js';
import styles from './TrustStrip.module.css';

export function TrustStrip() {
  return (
    <section className={styles.section} aria-label="Trust metrics strip">
      {/* Row 1: Infinite Scroll Left */}
      <div className={styles.marqueeRow} aria-hidden="true">
        <div className={`${styles.track} ${styles.scrollLeft}`}>
          {[...trustStripData.items, ...trustStripData.items, ...trustStripData.items].map((item, idx) => (
            <div key={idx} className={styles.item}>
              <span className={styles.text}>{item}</span>
              <span className={styles.separator}>◆</span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Infinite Scroll Right */}
      <div className={styles.marqueeRow} aria-hidden="true">
        <div className={`${styles.track} ${styles.scrollRight}`}>
          {[...trustStripData.items, ...trustStripData.items, ...trustStripData.items].reverse().map((item, idx) => (
            <div key={idx} className={styles.item}>
              <span className={styles.text}>{item}</span>
              <span className={styles.separator}>◆</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default React.memo(TrustStrip);
