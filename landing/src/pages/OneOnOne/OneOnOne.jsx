import { useState } from 'react';
import { oneOnOneData } from '../../data/data.js';
import { useInView } from '../../hooks/useInView';
import {
  Target, LineChart, ShieldCheck,
  MessageCircle, Clock, RefreshCw,
  CheckCircle, ChevronDown
} from 'lucide-react';
import Testimonials from '../../sections/Testimonials/Testimonials';
import styles from './OneOnOne.module.css';

// Icon map
const iconMap = {
  Target,
  LineChart,
  ShieldCheck,
  MessageCircle,
  Clock,
  RefreshCw,
};

// ── FAQ Item ──────────────────────────────────────────
function FaqItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${styles.faqItem} ${open ? styles.faqOpen : ''}`}>
      <button
        className={styles.faqTrigger}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{faq.q}</span>
        <ChevronDown size={18} className={styles.faqIcon} />
      </button>
      <div className={styles.faqAnswer}>
        <p>{faq.a}</p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────
export default function OneOnOne() {
  const [heroRef, heroInView] = useInView(0.1);
  const [benefitsRef, benefitsInView] = useInView(0.1);
  const [pricingRef, pricingInView] = useInView(0.1);
  const [callRef, callInView] = useInView(0.1);
  const [faqRef, faqInView] = useInView(0.1);
  const [ctaRef, ctaInView] = useInView(0.1);

  const { hero, benefits, pricing, callProof, faq, cta } = oneOnOneData;

  return (
    <main className={styles.page}>

      {/* ── HERO ─────────────────────────────── */}
      <section
        id="hero"
        className={`${styles.hero} ${heroInView ? styles.visible : ''}`}
        ref={heroRef}
      >
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <span className={styles.badge}>{hero.badge}</span>
            <h1 className={styles.heroHeadline}>
              <span className={styles.headlineWhite}>{hero.headlineTop}</span>
              <span className={styles.headlineAccent}>{hero.headlineBottom}</span>
            </h1>
            <p className={styles.heroSub}>{hero.subheadline}</p>
            <div className={styles.heroButtons}>
              <a href="/enroll/1on1" className={styles.btnPrimary}>{hero.ctaPrimary}</a>
              <a href="#results" className={styles.btnSecondary}>{hero.ctaSecondary}</a>
            </div>
          </div>
          <div className={styles.heroImage}>
            <img
              src={hero.image}
              alt={hero.imageAlt}
              className={styles.heroImg}
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* ── WHAT YOU GET ─────────────────────── */}
      <section
        className={`${styles.section} ${benefitsInView ? styles.visible : ''}`}
        ref={benefitsRef}
      >
        <div className={styles.container}>
          <span className={styles.badge}>{benefits.badge}</span>
          <h2 className={styles.heading}>{benefits.heading}</h2>
          <div className={styles.benefitsGrid}>
            {benefits.items.map((item, i) => {
              const Icon = iconMap[item.icon];
              return (
                <div key={i} className={styles.benefitCard} style={{ '--i': i }}>
                  <div className={styles.benefitIcon}>
                    {Icon && <Icon size={22} />}
                  </div>
                  <h3 className={styles.benefitTitle}>{item.title}</h3>
                  <p className={styles.benefitDesc}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────── */}
      <section
        id="pricing"
        className={`${styles.section} ${pricingInView ? styles.visible : ''}`}
        ref={pricingRef}
      >
        <div className={styles.container}>
          <span className={styles.badge}>{pricing.badge}</span>
          <h2 className={styles.heading}>{pricing.heading}</h2>
          <div className={styles.pricingCard}>
            <div className={styles.pricingTop}>
              <span className={styles.discountBadge}>{pricing.discount}</span>
              <span className={styles.originalPrice}>{pricing.originalPrice}</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.currentPrice}>{pricing.currentPrice}</span>
              <span className={styles.priceLabel}>/ per session</span>
            </div>
            <ul className={styles.featureList}>
              {pricing.features.map((f, i) => (
                <li key={i} className={styles.featureItem}>
                  <CheckCircle size={16} className={styles.checkIcon} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <a href="/enroll/1on1" className={styles.pricingCta}>{pricing.cta}</a>
            <p className={styles.pricingNote}>{pricing.note}</p>
            {pricing.guarantee && (
              <p className={styles.guarantee}>
                <ShieldCheck size={14} /> {pricing.guarantee}
              </p>
            )}
            <div className={styles.paymentLogos}>
              {/* UPI */}
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png"
                alt="UPI" className={styles.paymentLogo}
              />
              {/* GPay */}
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png"
                alt="Google Pay" className={styles.paymentLogo}
              />
              {/* PhonePe */}
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/PhonePe_Logo.svg/1200px-PhonePe_Logo.svg.png"
                alt="PhonePe" className={styles.paymentLogo}
              />
              {/* Razorpay */}
              <img
                src="https://razorpay.com/assets/razorpay-glyph.svg"
                alt="Razorpay" className={styles.paymentLogo}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CALL PROOF ───────────────────────── */}
      <section
        id="results"
        className={`${styles.section} ${callInView ? styles.visible : ''}`}
        ref={callRef}
      >
        <div className={styles.container}>
          <span className={styles.badge}>{callProof.badge}</span>
          <h2 className={styles.heading}>{callProof.heading}</h2>
          <p className={styles.subheading}>{callProof.subheading}</p>
          <div className={styles.callGrid}>
            {callProof.images.map((img) => (
              <div key={img.id} className={styles.callCard}>
                <span className={styles.callLabel}>{img.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────── */}
      <Testimonials />

      {/* ── FAQ ──────────────────────────────── */}
      <section
        className={`${styles.section} ${faqInView ? styles.visible : ''}`}
        ref={faqRef}
      >
        <div className={styles.container}>
          <span className={styles.badge}>{faq.badge}</span>
          <h2 className={styles.heading}>{faq.heading}</h2>
          <div className={styles.faqList}>
            {faq.faqs.map((item, i) => (
              <FaqItem key={i} faq={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section
        className={`${styles.ctaSection} ${ctaInView ? styles.visible : ''}`}
        ref={ctaRef}
      >
        <div className={styles.container}>
          <p className={styles.urgency}>{cta.urgency}</p>
          <h2 className={styles.ctaHeading}>{cta.heading}</h2>
          <p className={styles.ctaSub}>{cta.subheading}</p>
          <a href="/enroll/1on1" className={styles.btnPrimary}>{cta.cta}</a>
        </div>
      </section>

    </main>
  );
}
