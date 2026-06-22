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
        // Estado real ANTES de cerrar los demás (aria-expanded no es la fuente de verdad)
        const isExpanding = !faqItem.classList.contains('is-open');
        // Close all siblings
        faqHeaders.forEach(h => {
          h.closest('.faq-item')?.classList.remove('is-open');
          h.setAttribute('aria-expanded', 'false');
        });
        if (isExpanding) {
          faqItem?.classList.add('is-open');
        }
        // a11y: refleja el estado (sin basar la lógica en este atributo)
        header.setAttribute('aria-expanded', String(isExpanding));
      });
    });
  }

  return { init };
})();
