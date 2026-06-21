/**
 * ================================================================
 * MÓDULO: SCROLL REVEAL — Enhanced (one-shot, staggered children)
 * Ensures every section has reveal-up classes applied uniformly.
 * ================================================================
 */
import { REDUCED_MOTION } from '../utils/reducedMotion.js';

export const ScrollRevealEnhancedModule = (() => {
  function init() {
    if (REDUCED_MOTION) {
      // Instantly reveal everything
      document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right')
        .forEach(el => el.classList.add('is-visible'));
      return;
    }

    const elements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    if (!elements.length || !('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // one-shot only
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '-30px 0px -30px 0px'
    });

    elements.forEach(el => observer.observe(el));
  }

  return { init };
})();
