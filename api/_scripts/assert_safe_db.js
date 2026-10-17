// api/_scripts/assert_safe_db.js
require('dotenv').config({ path: 'api/.env' });
require('dotenv').config();
const { isProtectedUser } = require('./protected');

function assertSafeDb() {
  if (process.env.CONFIRM_DB !== 'yes') {
    throw new Error('OPERACIÓN ABORTADA: Debes definir CONFIRM_DB="yes" en el entorno para autorizar la ejecución de pruebas.');
  }

  const dbUrl = process.env.DATABASE_URL || '';
  if (!dbUrl) {
    throw new Error('OPERACIÓN ABORTADA: DATABASE_URL no está configurada.');
  }

  try {
    const parsed = new URL(dbUrl);
    const host = parsed.hostname;
    const maskedHost = host.length > 8 
      ? host.substring(0, 4) + '***' + host.substring(host.length - 8)
      : '***';
    console.log(`[assert_safe_db] Conectado a BD segura. Host enmascarado: ${maskedHost}`);
  } catch {
    console.log('[assert_safe_db] Conectado a BD con URL enmascarada.');
  }

  return true;
}

function assertCreated(created, id) {
  if (!id) {
    throw new Error('OPERACIÓN ABORTADA: assertCreated requiere un id válido.');
  }

  if (isProtectedUser(id)) {
    throw new Error(`OPERACIÓN ABORTADA: El id "${id}" pertenece a un usuario protegido. Mutación estrictamente prohibida.`);
  }

  let found = false;

  if (created instanceof Set) {
    found = created.has(id);
  } else if (Array.isArray(created)) {
    found = created.includes(id);
  } else if (created && typeof created === 'object') {
    for (const key of Object.keys(created)) {
      const val = created[key];
      if (val instanceof Set && val.has(id)) {
        found = true;
        break;
      }
      if (Array.isArray(val) && val.includes(id)) {
        found = true;
        break;
      }
      if (val === id) {
        found = true;
        break;
      }
    }
  }

  if (!found) {
    throw new Error(`OPERACIÓN ABORTADA: El id "${id}" no pertenece al registro de entidades creadas en esta corrida de pruebas.`);
  }
}

function assertTargetNotProtected(userOrId) {
  if (isProtectedUser(userOrId)) {
    throw new Error(`OPERACIÓN ABORTADA: Intento de modificar usuario protegido (${JSON.stringify(userOrId)})`);
  }
}

module.exports = {
  assertSafeDb,
  assertCreated,
  assertTargetNotProtected
};
