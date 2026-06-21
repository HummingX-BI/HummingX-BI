/**
 * ================================================================
 * MÓDULO: MARQUEE INFINITO para sección de atributos/respaldo
 * Auto-scroll continuo, pausa on hover (desktop), fade edges.
 * Si no existe el elemento, no hace nada (graceful).
 * ================================================================
 */
import { REDUCED_MOTION } from '../utils/reducedMotion.js';

export const MarqueeModule = (() => {
  function buildMarquee(container) {
    if (!container || REDUCED_MOTION) return;

    // Clone children for seamless loop
    const track = container.querySelector('.marquee__track');
    if (!track) return;

    const items = track.querySelectorAll('.marquee__item');
    if (!items.length) return;

    // Duplicate items to create seamless loop
    items.forEach(item => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });

    // Pause on hover (desktop only)
    container.addEventListener('mouseenter', () => {
      track.style.animationPlayState = 'paused';
    });
    container.addEventListener('mouseleave', () => {
      track.style.animationPlayState = 'running';
    });
  }

  function init() {
    const marquees = document.querySelectorAll('.marquee');
    marquees.forEach(buildMarquee);
  }

  return { init };
})();
