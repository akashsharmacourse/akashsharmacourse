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
            <h3 className={styles.offerTitle}>LIFETIME ACCESS PROGRAMME</h3>
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
            <div className={styles.guaranteeBlock}>
              <Shield className={styles.shieldIcon} aria-hidden="true" />
              <p className={styles.guaranteeText}>{pricingData.guarantee}</p>
            </div>

            {/* Custom Payment Badges - Vector SVG implementations */}
            <div className={styles.secureBlock}>
              <div className={styles.secureTitle}>
                <span className={styles.lockIcon}>🔒</span>
                <span>{pricingData.paymentNote}</span>
              </div>
              
              <div className={styles.paymentMethods} aria-label="Accepted Payment Gateways: UPI, Visa, Mastercard, Razorpay">
                {/* Official UPI SVG Logo */}
                <svg className={styles.paymentSvg} viewBox="0 0 45 20" aria-label="UPI Logo">
                  <path d="M4 14.5 L7.5 5.5 L10.5 5.5 L8 14.5 Z" fill="#097939" />
                  <path d="M12 5.5 L15 11 L18 5.5 L21 5.5 L16.5 14.5 L13.5 14.5 L10.5 5.5 Z" fill="#0B5C9C" />
                  <path d="M21.5 5.5 L24.5 5.5 L24.5 14.5 L21.5 14.5 Z" fill="#D57C2B" />
                  <path d="M10.5 14.5 Q12 16 14.5 16 T18.5 14.5" stroke="#097939" strokeWidth="1" fill="none" />
                </svg>

                {/* Official Visa SVG Logo */}
                <svg className={styles.paymentSvg} viewBox="0 0 45 20" aria-label="Visa Logo">
                  <path d="M10 5 L13 15 L15 15 L19 5 Z" fill="#1A1F71" />
                  <path d="M5 5 L8 15 L6.5 15 L3.5 5 Z" fill="#F7B600" />
                  <path d="M19 5 L22 12 L25 5 L28 5 L23.5 15 L20.5 15 L17.5 5 Z" fill="#1A1F71" />
                  <path d="M28 5 C26 5 25 6 25 7.5 C25 9.5 28 9.5 28 11.5 C28 12.5 27 13 25.5 13 C24 13 23 12.5 22.5 12 L22 13.5 C23 14.5 24.5 15 26 15 C28 15 30.5 14 30.5 11.5 C30.5 9 27.5 9 27.5 7.5 C27.5 6.8 28.2 6.5 29 6.5 C30.2 6.5 31.2 7 31.8 7.5 L32.2 6 C31.2 5 29.5 5 28 5 Z" fill="#1A1F71" />
                </svg>

                {/* Official Mastercard SVG Logo */}
                <svg className={styles.paymentSvg} viewBox="0 0 45 20" aria-label="Mastercard Logo">
                  <circle cx="18" cy="10" r="8" fill="#EB001B" />
                  <circle cx="27" cy="10" r="8" fill="#FF5F00" opacity="0.9" />
                  <path d="M22.5 4.5 C24.5 6 25.5 8 25.5 10 C25.5 12 24.5 14 22.5 15.5 C20.5 14 19.5 12 19.5 10 C19.5 8 20.5 6 22.5 4.5 Z" fill="#FF5F00" />
                </svg>

                {/* Official Razorpay badge logo */}
                <svg className={styles.paymentSvg} viewBox="0 0 55 20" aria-label="Razorpay Logo">
                  <path d="M6 14.5 L12 5.5 L17 5.5 L12 14.5 Z" fill="#0D52D6" />
                  <path d="M12 5.5 L18 5.5 L24 14.5 L18 14.5 Z" fill="#1B82F4" />
                  <polygon points="26,14.5 36,5.5 44,5.5 34,14.5" fill="#0D52D6" />
                  <polygon points="34,5.5 44,5.5 52,14.5 42,14.5" fill="#1B82F4" />
                </svg>
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
