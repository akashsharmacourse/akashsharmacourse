import React, { useState } from 'react';
import { faqData } from '../../data/data.js';
import { useInView } from '../../hooks/useInView';
import styles from './FAQ.module.css';

export function FAQ() {
  const [revealRef, isVisible] = useInView(0.15);
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (idx) => {
    setActiveIndex(activeIndex === idx ? null : idx);
  };

  return (
    <section 
      id="faq" 
      ref={revealRef}
      className={`${styles.section} ${isVisible ? styles.visible : ''}`}
      aria-label="Frequently Asked Questions about Stock Market Mastery Programme"
    >
      <div className={`${styles.container} container`}>
        {/* Header Block */}
        <div className={styles.header} style={{ '--i': 1 }}>
          <div className={styles.badge}>{faqData.badge}</div>
          <h2 className={styles.heading}>{faqData.heading}</h2>
        </div>

        {/* Single Glass Card Wrapping All Accordions */}
        <div className={styles.accordionsWrapper} style={{ '--i': 2 }}>
          <div className={styles.accordionsList}>
            {faqData.faqs.map((faq, idx) => {
              const isOpen = activeIndex === idx;

              return (
                <div 
                  key={idx} 
                  className={`${styles.accordionItem} ${isOpen ? styles.itemOpen : ''}`}
                  style={{ '--i': idx + 3 }}
                >
                  <h3>
                    <button 
                      className={styles.triggerButton}
                      onClick={() => toggleFAQ(idx)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${idx}`}
                      id={`faq-trigger-${idx}`}
                    >
                      <span className={`${styles.questionText} ${isOpen ? styles.activeQuestion : ''}`}>
                        {faq.q}
                      </span>
                      <span className={styles.icon} aria-hidden="true">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                  </h3>

                  {/* Accordion body using grid-rows for smooth height transition */}
                  <div 
                    id={`faq-answer-${idx}`}
                    className={`${styles.answerWrapper} ${isOpen ? styles.expanded : ''}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${idx}`}
                    aria-hidden={!isOpen}
                  >
                    <div className={styles.answerInner}>
                      <p className={styles.answerText}>{faq.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default React.memo(FAQ);
