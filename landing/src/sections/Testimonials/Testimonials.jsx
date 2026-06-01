import React, { useState, useRef } from 'react';
import { testimonialsData } from '../../data/data.js';
import { useInView } from '../../hooks/useInView';
import { Play } from 'lucide-react';
import styles from './Testimonials.module.css';

export function Testimonials() {
  const [ref, inView] = useInView(0.1);
  const [active, setActive] = useState(0);
  const startX = useRef(0);

  const total = testimonialsData.testimonials.length;

  const handleDragStart = (e) => {
    startX.current = e.touches ? e.touches[0].clientX : e.clientX;
  };

  const handleDragEnd = (e) => {
    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const diff = startX.current - endX;
    if (diff > 40) setActive((prev) => Math.min(prev + 1, total - 1));
    if (diff < -40) setActive((prev) => Math.max(prev - 1, 0));
  };

  return (
    <section
      id="testimonials"
      className={`${styles.section} ${inView ? styles.visible : ''}`}
      ref={ref}
      aria-label="Student video testimonials carousel"
    >
      <div className={styles.container}>
        <span className={styles.badge}>{testimonialsData.badge}</span>
        <h2 className={styles.heading}>{testimonialsData.heading}</h2>

        {/* Carousel */}
        <div
          className={styles.carousel}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
          role="region"
          aria-label="Draggable student video reviews slider"
        >
          <div
            className={styles.track}
            style={{ transform: `translateX(calc(-${active * 100}% - ${active * 16}px))` }}
          >
            {testimonialsData.testimonials.map((t) => (
              <div key={t.id} className={styles.card}>
                <div className={styles.videoArea}>
                  <div className={styles.playBtn} aria-label={`Play review from ${t.name}`}>
                    <Play size={28} fill="currentColor" />
                  </div>
                </div>
                <div className={styles.info}>
                  <span className={styles.name}>{t.name}</span>
                  <span className={styles.role}>{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className={styles.dots} aria-label="Slider navigation controls">
          {testimonialsData.testimonials.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              aria-current={i === active ? 'true' : 'false'}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default React.memo(Testimonials);
