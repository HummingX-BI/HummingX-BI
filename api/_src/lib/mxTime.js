/**
 * Utility for parsing dates in Mexico City timezone (America/Mexico_City)
 * without external dependencies.
 */
function mxParts(inputDate) {
  const d = inputDate ? new Date(inputDate) : new Date();
  if (isNaN(d.getTime())) {
    return { ymd: '', hour: 0, dow: 0 };
  }

  // en-CA formats date as YYYY-MM-DD
  const dateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d);

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Mexico_City',
    hour: 'numeric',
    hourCycle: 'h23',
    weekday: 'short'
  }).formatToParts(d);

  const hourPart = parts.find(p => p.type === 'hour');
  const hour = hourPart ? parseInt(hourPart.value, 10) : 0;

  const weekdayPart = parts.find(p => p.type === 'weekday');
  const dowMap = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
  const dow = (weekdayPart && dowMap[weekdayPart.value] !== undefined) ? dowMap[weekdayPart.value] : 0;

  return { ymd: dateStr, hour, dow };
}

module.exports = { mxParts };
