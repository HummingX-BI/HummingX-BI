/**
 * ================================================================
 * UTIL: Preferencia de movimiento reducido
 * Se evalúa una sola vez y se comparte entre los módulos de animación.
 * ================================================================
 */

/* ── Detect reduced motion preference ────────────────────────── */
export const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
