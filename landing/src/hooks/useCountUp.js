import { useEffect, useState } from 'react';

/**
 * useCountUp Hook
 * Animates a numeric value from 0 to target over a specified duration in ms.
 * Only triggers animation when inView is true.
 */
export function useCountUp(target, duration = 2000, inView = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    
    let start = 0;
    const step = target / (duration / 16); // ~60fps step calculations
    
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration, inView]);

  return count;
}
