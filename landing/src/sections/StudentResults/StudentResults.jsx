import React, { useState } from 'react';
import { studentResultsData } from '../../data/data.js';
import { useInView } from '../../hooks/useInView';
import styles from './StudentResults.module.css';

export function StudentResults() {
  const [ref, inView] = useInView(0.1);
  const [showAll, setShowAll] = useState(false);

  const allResults = studentResultsData.results;
  const visibleResults = allResults;

  return (
    <section 
      id="results-students" 
      ref={ref}
      className={`${styles.section} ${inView ? styles.visible : ''}`}
      aria-label="Student trading results screenshots"
    >
      <div className={styles.radialGlow}></div>

      <div className={styles.container}>
        <span className={styles.badge}>{studentResultsData.badge}</span>
        <h2 className={styles.heading}>{studentResultsData.heading}</h2>
        <p className={styles.subheading}>{studentResultsData.subheading}</p>

        <div className={styles.grid}>
          {visibleResults.map((result, i) => (
            <div
              key={result.id}
              className={styles.card}
              style={{ '--i': i }}
            >
              {result.placeholder ? (
                <div className={styles.placeholder} />
              ) : (
                <img
                  src={result.image.includes('/upload/') && !result.image.includes('/upload/q_auto') ? result.image.replace('/upload/', '/upload/q_auto,f_auto,w_400/') : result.image}
                  alt="Student Result"
                  className={styles.image}
                  loading="lazy"
                  decoding="async"
                />
              )}
            </div>
          ))}
        </div>

        {/* View More — mobile only, hidden after expand */}
        {!showAll && (
          <button
            className={styles.viewMoreBtn}
            onClick={() => setShowAll(true)}
            aria-label="View more student results"
          >
            View More Results
          </button>
        )}

        <p className={styles.note}>{studentResultsData.note}</p>
      </div>
    </section>
  );
}

export default React.memo(StudentResults);
