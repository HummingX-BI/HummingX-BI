/**
 * ================================================================
 * UTIL: Helpers de DOM sueltos
 * ================================================================
 */

/* ── Footer: año dinámico ────────────────────────────────────── */
export function setFooterYear() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}
