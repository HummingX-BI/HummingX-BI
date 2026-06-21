/**
 * ================================================================
 * MÓDULO: ENHANCED CAROUSEL
 * - Keyboard navigation (arrow keys)
 * - Touch swipe support (native scroll-snap + touch events)
 * - Auto-width scroll calculation based on actual card width
 * - Smooth progress bar updates
 * - Peek effect: first/last card fade to indicate more content
 * ================================================================
 */
import { REDUCED_MOTION } from '../utils/reducedMotion.js';

export const EnhancedCarouselModule = (() => {
  function initCarousel(wrapper) {
    const container = wrapper.querySelector('.carousel-container');
    const prevBtn   = wrapper.querySelector('.carousel-prev');
    const nextBtn   = wrapper.querySelector('.carousel-next');
    const progressBar = wrapper.querySelector('.carousel-progress-bar');

    if (!container) return;

    /* ── Progress bar update ────────────────────────── */
    function updateProgress() {
      if (!progressBar) return;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const progress  = maxScroll > 0 ? (container.scrollLeft / maxScroll) * 100 : 0;
      // Min 8% width so bar is always visible
      progressBar.style.width = Math.max(8, Math.min(100, progress)) + '%';
    }

    container.addEventListener('scroll', updateProgress, { passive: true });

    /* ── Button navigation ──────────────────────────── */
    function scrollByCard(direction) {
      // Use actual card width for precise snapping
      const firstCard = container.querySelector('.solution-card, .project-card');
      const cardWidth = firstCard
        ? firstCard.getBoundingClientRect().width + 24 // 24 = gap
        : 320;
      container.scrollBy({ left: direction * cardWidth, behavior: REDUCED_MOTION ? 'instant' : 'smooth' });
    }

    if (prevBtn) prevBtn.addEventListener('click', () => scrollByCard(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => scrollByCard(1));

    /* ── Keyboard navigation ────────────────────────── */
    container.setAttribute('tabindex', '0');
    container.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); scrollByCard(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); scrollByCard(1);  }
    });

    /* ── Button state: disable at edges ─────────────── */
    function updateBtnState() {
      if (!prevBtn || !nextBtn) return;
      const atStart = container.scrollLeft <= 2;
      const atEnd   = container.scrollLeft >= container.scrollWidth - container.clientWidth - 2;
      prevBtn.style.opacity = atStart ? '0.3' : '1';
      nextBtn.style.opacity = atEnd   ? '0.3' : '1';
    }

    container.addEventListener('scroll', updateBtnState, { passive: true });

    /* ── Init ─────────────────────────────────────── */
    setTimeout(() => {
      updateProgress();
      updateBtnState();
    }, 150);
  }

  function init() {
    const wrappers = document.querySelectorAll('.carousel-wrapper');
    wrappers.forEach(initCarousel);
  }

  return { init };
})();
