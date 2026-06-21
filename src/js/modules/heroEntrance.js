/**
 * ================================================================
 * MÓDULO: HERO ENTRANCE ANIMATION
 * Staggered fade+translateY on page load, after preloader.
 * ================================================================
 */
import { REDUCED_MOTION } from '../utils/reducedMotion.js';

export const HeroEntranceModule = (() => {
  function init() {
    if (REDUCED_MOTION) {
      // Skip animation — make everything immediately visible
      document.querySelectorAll('.hero__eyebrow, .hero__title, .hero__subtitle, .hero__cta-wrapper, .hero__context-pills')
        .forEach(el => el.style.opacity = '1');
      return;
    }

    const timeline = [
      { selector: '.hero__eyebrow',       delay: 100 },
      { selector: '.hero__title',          delay: 260 },
      { selector: '.hero__subtitle',       delay: 440 },
      { selector: '.hero__cta-wrapper',    delay: 580 },
      { selector: '.hero__context-pills',  delay: 700 },
    ];

    // Set initial state (CSS should also handle this, but JS ensures consistency)
    timeline.forEach(({ selector }) => {
      const el = document.querySelector(selector);
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'none';
    });

    // Trigger staggered entrance after a tiny delay (ensures paint)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        timeline.forEach(({ selector, delay }) => {
          const el = document.querySelector(selector);
          if (!el) return;
          setTimeout(() => {
            el.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, delay);
        });
      });
    });
  }

  return { init };
})();
