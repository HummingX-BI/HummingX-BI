// portal/src/pages/admin/client-detail/dateUtils.js
export function parseSafeLocalDate(dateVal) {
  if (!dateVal) return new Date();
  if (typeof dateVal === 'string' && dateVal.includes('-') && !dateVal.includes('T')) {
    const parts = dateVal.split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0);
  }
  return new Date(dateVal);
}

export function formatSafeDate(dateVal) {
  if (!dateVal) return '—';
  const d = parseSafeLocalDate(dateVal);
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}
