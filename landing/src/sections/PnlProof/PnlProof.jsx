import React from 'react';
import { pnlProofData } from '../../data/data.js';
import { useInView } from '../../hooks/useInView';
import { ExternalLink } from 'lucide-react';
import styles from './PnlProof.module.css';

export function PnlProof() {
  const [revealRef, isVisible] = useInView(0.15);

  return (
    <section 
      id="results" 
      ref={revealRef}
      className={`${styles.section} ${isVisible ? styles.visible : ''}`}
      aria-label="Verified trading proof and PnL metrics"
    >
      <div className={styles.radialGlow}></div>

      <div className={`${styles.container} container`}>
        {/* Header Block */}
        <div className={styles.header} style={{ '--i': 1 }}>
          <div className={styles.badge}>{pnlProofData.badge}</div>
          <h2 className={styles.heading}>{pnlProofData.heading}</h2>
          <p className={styles.subheading}>{pnlProofData.subheading}</p>
        </div>

        {/* ONE Single Centered Real Proof Image */}
        <div className={styles.proofImageWrap} style={{ '--i': 2 }}>
          <img
            src={pnlProofData.proof.image}
            alt={pnlProofData.proof.imageAlt}
            className={styles.proofImage}
            loading="lazy"
          />
        </div>

        {/* Disclaimer row */}
        <div className={styles.footer} style={{ '--i': 3 }}>
          <p className={styles.disclaimer}>{pnlProofData.disclaimer}</p>
        </div>

        {/* Live PnL Button */}
        <a
          href={pnlProofData.livePnlLink}
          className={styles.livePnlBtn}
          target="_blank"
          rel="noopener noreferrer"
          style={{ '--i': 2.5 }}
        >
          <ExternalLink size={16} />
          {pnlProofData.livePnlBtn}
        </a>

        
      </div>
    </section>
  );
}

export default React.memo(PnlProof);
