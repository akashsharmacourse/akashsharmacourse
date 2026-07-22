import React from 'react';
import { courseData } from '../../data/data.js';
import { useInView } from '../../hooks/useInView';
import { ChartLine, Zap, TrendingUp, CheckCircle } from 'lucide-react';
import styles from './Courses.module.css';

export function Courses() {
  const [revealRef, isVisible] = useInView(0.15);
  const { offer } = courseData;

  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'ChartLine': return <ChartLine className={styles.moduleIcon} aria-hidden="true" />;
      case 'Zap': return <Zap className={styles.moduleIcon} aria-hidden="true" />;
      case 'TrendingUp': return <TrendingUp className={styles.moduleIcon} aria-hidden="true" />;
      default: return null;
    }
  };

  return (
    <section 
      id="courses" 
      ref={revealRef}
      className={`${styles.section} ${isVisible ? styles.visible : ''}`}
      aria-label="Stock Market Mastery Program Course Details"
    >
      <div className={styles.radialGlow}></div>

      <div className={`${styles.container} container`}>
        {/* Centered Heading */}
        <div className={styles.header} style={{ '--i': 1 }}>
          <div className={styles.badge}>{courseData.badge}</div>
          <h2 className={styles.heading}>{courseData.heading}</h2>
          <p className={styles.subheading}>{courseData.subheading}</p>
        </div>

        {/* Single Massive Course Card */}
        <div className={styles.cardWrapper} style={{ '--i': 2 }}>
          <div className={styles.offerCard}>
            
            {/* Left Column: Modules Included */}
            <div className={styles.colLeft}>
              <h3 className={styles.colTitle}>PROGRAMME CURRICULUM</h3>
              <div className={styles.modulesGrid}>
                {offer.included.map((mod, idx) => (
                  <div key={idx} className={styles.moduleItem}>
                    <div className={styles.iconBox}>
                      {renderIcon(mod.icon)}
                    </div>
                    <div className={styles.moduleContent}>
                      <h4 className={styles.moduleTitle}>{mod.title}</h4>
                      <p className={styles.moduleDesc}>{mod.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Benefits, Pricing, and Enrollment */}
            <div className={styles.colRight}>
              <h3 className={styles.colTitle}>STUDENT BENEFITS</h3>
              
              <ul className={styles.benefitsList}>
                {offer.benefits.map((benefit, idx) => (
                  <li key={idx} className={styles.benefitItem}>
                    <CheckCircle className={styles.checkIcon} aria-hidden="true" />
                    <span className={styles.benefitText}>{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* Pricing Blocks */}
              <div className={styles.pricingBlock}>
                <div className={styles.priceHeader}>
                  <span className={styles.discountTag}>{offer.discount}</span>
                  <span className={styles.originalPrice}>{offer.originalPrice}</span>
                </div>
                <div className={styles.priceRow}>
                  <span className={styles.priceVal}>{offer.currentPrice}</span>
                  <span className={styles.pricePeriod}>/ ONE-TIME</span>
                </div>
              </div>

              {/* Action Button */}
              <a 
                href="/enroll" 
                className={styles.ctaButton}
                aria-label="Enroll in Stock Market mastery programme now"
              >
                {offer.cta}
              </a>

              {/* Secure transactional note */}
              <p className={styles.note}>{offer.note}</p>
            </div>

            {/* Glowing Corner Accents */}
            <div className={`${styles.corner} ${styles.cornerTL}`}></div>
            <div className={`${styles.corner} ${styles.cornerTR}`}></div>
            <div className={`${styles.corner} ${styles.cornerBL}`}></div>
            <div className={`${styles.corner} ${styles.cornerBR}`}></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default React.memo(Courses);
