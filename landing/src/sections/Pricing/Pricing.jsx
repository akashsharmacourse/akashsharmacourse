import React from 'react';
import { pricingData } from '../../data/data.js';
import { useInView } from '../../hooks/useInView';
import { CheckCircle, Shield } from 'lucide-react';
import styles from './Pricing.module.css';

export function Pricing() {
  const [revealRef, isVisible] = useInView(0.15);

  return (
    <section 
      id="pricing" 
      ref={revealRef}
      className={`${styles.section} ${isVisible ? styles.visible : ''}`}
      aria-label="Secure course enrollment pricing"
    >
      <div className={styles.radialGlow}></div>

      <div className={`${styles.container} container`}>
        {/* Header Block */}
        <div className={styles.header} style={{ '--i': 1 }}>
          <div className={styles.badge}>{pricingData.badge}</div>
          <h2 className={styles.heading}>{pricingData.heading}</h2>
          <p className={styles.subheading}>{pricingData.subheading}</p>
        </div>

        {/* Centered Large Offering Box */}
        <div className={styles.cardWrapper} style={{ '--i': 2 }}>
          <div className={styles.pricingCard}>
            
            {/* 50% OFF Pill */}
            <div className={styles.discountBadge}>
              <span className={styles.discountDot}></span>
              {pricingData.discount}
            </div>

            {/* Title Offer */}
            <h3 className={styles.offerTitle}>STOCK MARKET MASTERY PROGRAMME</h3>
            <p className={styles.offerSubtitle}>Get three entire strategy systems for a single price</p>

            {/* Pricing Section */}
            <div className={styles.priceContainer}>
              <span className={styles.originalPrice}>{pricingData.originalPrice}</span>
              <div className={styles.currentPriceRow}>
                <span className={styles.priceVal}>{pricingData.currentPrice}</span>
                <span className={styles.pricePeriod}>/ ONE-TIME</span>
              </div>
            </div>

            {/* Checklist of modules - Lucide icons only (no emojis) */}
            <ul className={styles.featuresList}>
              {pricingData.features.map((feat, idx) => (
                <li key={idx} className={styles.featureItem} style={{ '--i': idx + 3 }}>
                  <CheckCircle className={styles.checkIcon} aria-hidden="true" />
                  <span className={styles.featureText}>{feat}</span>
                </li>
              ))}
            </ul>

            {/* Action Trigger Button (No Price in CTA) */}
            <a 
              href="/enroll" 
              className={styles.ctaButton}
              aria-label="Enroll in Stock Market mastery course now"
            >
              {pricingData.cta}
            </a>

            {/* Secure guarantees */}
            {pricingData.guarantee && (
              <div className={styles.guaranteeBlock}>
                <Shield className={styles.shieldIcon} aria-hidden="true" />
                <p className={styles.guaranteeText}>{pricingData.guarantee}</p>
              </div>
            )}

            {/* Custom Payment Badges - Vector SVG implementations */}
            <div className={styles.secureBlock}>
              <div className={styles.secureTitle}>
                <span className={styles.lockIcon}>🔒</span>
                <span>{pricingData.paymentNote}</span>
              </div>
              
              <div className={styles.paymentLogos}>
                {pricingData.paymentMethods.map((method) => (
                  <div key={method.name} className={styles.paymentCircle}>
                    <img
                      src={method.logo}
                      alt={method.name}
                      className={styles.paymentLogo}
                    />
                  </div>
                ))}
              </div>
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

export default React.memo(Pricing);
