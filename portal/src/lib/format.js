/**
 * Helper to format duration in seconds into human-readable string.
 * - null / 0 / undefined -> '—'
 * - 0 < sec < 60 -> '<1 min'
 * - < 3600 -> 'N min'
 * - else -> 'H h MM min'
 */
export function fmtDuration(sec) {
  if (sec == null || sec <= 0 || isNaN(sec)) {
    return '—';
  }

  if (sec < 60) {
    return '<1 min';
  }

  if (sec < 3600) {
    const mins = Math.round(sec / 60);
    return `${mins} min`;
  }

  const hours = Math.floor(sec / 3600);
  const remainingMinutes = Math.round((sec % 3600) / 60);
  const mm = String(remainingMinutes).padStart(2, '0');
  return `${hours} h ${mm} min`;
}
