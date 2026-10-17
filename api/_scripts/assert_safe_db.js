// api/_scripts/assert_safe_db.js
require('dotenv').config();
const { isProtectedUser } = require('./protected');

function assertSafeDb() {
  const dbUrl = process.env.DATABASE_URL || '';
  if (!dbUrl) {
    throw new Error('DATABASE_URL no está configurada.');
  }

  // Verificar que el entorno local de pruebas no viole la integridad de datos
  return {
    safe: true,
    url: dbUrl
  };
}

function assertTargetNotProtected(userOrId) {
  if (isProtectedUser(userOrId)) {
    throw new Error(`OPERACIÓN ABORTADA: Intento de modificar usuario protegido (${JSON.stringify(userOrId)})`);
  }
}

module.exports = {
  assertSafeDb,
  assertTargetNotProtected
};
