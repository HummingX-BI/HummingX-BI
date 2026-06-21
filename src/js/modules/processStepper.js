/**
 * ================================================================
 * MÓDULO: PROCESS STEPPER — Progressive line draw on scroll
 * Uses IntersectionObserver to mark steps active.
 * A CSS pseudo-element `::after` animates its `scaleX`.
 * ================================================================
 */
import { REDUCED_MOTION } from '../utils/reducedMotion.js';

export const ProcessStepperEnhancedModule = (() => {
  function init() {
    const steps = document.querySelectorAll('.process-step');
    if (!steps.length || REDUCED_MOTION) {
      // On reduced motion, just make all steps fully visible
      steps.forEach(s => s.classList.add('is-active'));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Activate with a small delay per step index for cascade effect
          const stepIndex = Array.from(steps).indexOf(entry.target);
          setTimeout(() => {
            entry.target.classList.add('is-active');
          }, stepIndex * 80);
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '-10% 0px -20% 0px',
      threshold: 0.3
    });

    steps.forEach(step => observer.observe(step));
  }

  return { init };
})();
