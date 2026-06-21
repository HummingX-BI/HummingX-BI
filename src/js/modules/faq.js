/**
 * ================================================================
 * MÓDULO: FAQ SMOOTH ACCORDION — CSS grid-template-rows transition
 * The CSS already uses grid-template-rows: 0fr → 1fr.
 * We only need to ensure --transition-normal is defined.
 * We also add a transition fix for browsers that need it.
 * ================================================================
 */
export const FaqSmoothModule = (() => {
  function init() {
    // The CSS handles the animation via grid-template-rows.
    // We patch the transition variable if it's missing.
    const rootStyle = getComputedStyle(document.documentElement);
    const hasNormalTransition = rootStyle.getPropertyValue('--transition-normal').trim();

    if (!hasNormalTransition) {
      document.documentElement.style.setProperty(
        '--transition-normal',
        '350ms cubic-bezier(0.25, 1, 0.5, 1)'
      );
    }

    // Enhance: also update border color on open
    const faqHeaders = document.querySelectorAll('.faq-item__header');
    faqHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const faqItem = header.closest('.faq-item');
        const isExpanding = header.getAttribute('aria-expanded') !== 'true';
        // Close all siblings
        faqHeaders.forEach(h => {
          h.closest('.faq-item')?.classList.remove('is-open');
        });
        if (isExpanding) {
          faqItem?.classList.add('is-open');
        }
      });
    });
  }

  return { init };
})();
