/**
 * ================================================================
 * MÓDULO: CURSOR MAGNÉTICO (Solo desktop)
 * El cursor personalizado sigue el ratón con un Lerp suave.
 * Al pasar sobre elementos interactivos, se expande (efecto magneto).
 * ================================================================
 */
export const MagneticCursorModule = (() => {
  const cursor = document.getElementById('magnetic-cursor');

  // Solo desktop con puntero fino (no táctil)
  const isPointerFine = window.matchMedia('(pointer: fine)').matches;
  if (!cursor || !isPointerFine) return { init: () => {} };

  let mouseX = -100, mouseY = -100;
  let cursorX = -100, cursorY = -100;
  const LERP = 0.12;

  const interactiveSelectors = 'a, button, .btn, .service-item, .attr-card, input, select, textarea, [data-cursor-hover]';

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.classList.add('is-visible');
  }, { passive: true });

  document.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));

  // Detectar hover en elementos interactivos
  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactiveSelectors)) {
      cursor.classList.add('is-hovering');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactiveSelectors)) {
      cursor.classList.remove('is-hovering');
    }
  });

  function renderCursor() {
    cursorX += (mouseX - cursorX) * LERP;
    cursorY += (mouseY - cursorY) * LERP;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    requestAnimationFrame(renderCursor);
  }

  function init() {
    renderCursor();
  }

  return { init };
})();
