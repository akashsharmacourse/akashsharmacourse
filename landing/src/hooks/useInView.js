import { useEffect, useRef, useState } from 'react';

/**
 * useInView Hook
 * Checks whether an element is inside the viewport with a specific threshold.
 * Once in view, it stays active and disconnects observer to maximize performance.
 */
export function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [threshold, inView]);

  return [ref, inView];
}
