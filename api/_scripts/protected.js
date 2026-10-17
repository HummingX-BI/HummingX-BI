// api/_scripts/protected.js
const PROTECTED_REGEX = /jm|nutri[oó]log|zammir/i;
const KNOWN_PROTECTED_IDS = new Set([
  'cmv1ydd0y0002i95aa0b6ohhf', // JM Nutriologo
  'cmuxb80qr0000mk9lh44jtxt9'  // Zammir
]);

function isProtectedUser(u) {
  if (!u) return false;
  if (typeof u === 'string') {
    return KNOWN_PROTECTED_IDS.has(u);
  }
  if (u.id && KNOWN_PROTECTED_IDS.has(u.id)) return true;
  return (
    PROTECTED_REGEX.test(u.name || '') ||
    PROTECTED_REGEX.test(u.companyName || '') ||
    PROTECTED_REGEX.test(u.email || '')
  );
}

module.exports = {
  PROTECTED_REGEX,
  KNOWN_PROTECTED_IDS,
  isProtectedUser
};
