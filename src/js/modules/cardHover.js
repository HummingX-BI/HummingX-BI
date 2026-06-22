/**
 * ================================================================
 * MÓDULO: CARD HOVER ENHANCEMENT
 * Adds subtle border-accent glow on hover to cards.
 * Pure CSS is preferred; this JS layer adds dynamic shadow.
 * ================================================================
 */
import { REDUCED_MOTION } from '../utils/reducedMotion.js';

export const CardHoverModule = (() => {
  function init() {
    if (REDUCED_MOTION) return;

    const cards = document.querySelectorAll(
      '.team-profile, .project-card, .solution-card, .process-step, .value-card'
    );

    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-3px)';
        card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,229,160,0.15)';
        card.style.borderColor = 'rgba(0,229,160,0.3)';
        card.style.transition = 'transform 200ms cubic-bezier(0.22,1,0.36,1), box-shadow 200ms ease, border-color 200ms ease';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.boxShadow = '';
        card.style.borderColor = '';
      });
    });
  }

  return { init };
})();
