/**
 * api/_tests/run_all_e2e.js
 * Master test runner for HummingX BI E2E test suites.
 * Orchestrates safe test server, verifies health & emailDryRun, runs test suites,
 * guarantees protected data integrity via cryptographic fingerprints,
 * executes cleanup and validates non-test table row counts.
 */

process.env.CONFIRM_DB = process.env.CONFIRM_DB || 'yes';
process.env.EMAIL_DRY_RUN = '1';
process.env.EMAIL_AUTO_NOTIFICATIONS = '0';
require('dotenv').config({ path: 'api/.env' });
require('dotenv').config();

const { spawn, execSync } = require('child_process');
const path = require('path');
const assert = require('assert');
const prisma = require('../_src/lib/prisma');
const { assertSafeDb } = require('../_scripts/assert_safe_db');
const { getProtectedFingerprints } = require('../_scripts/protected_fingerprint');

async function getNonTestCounts() {
  return {
    users: await prisma.user.count({
      where: {
        NOT: {
          OR: [
            { name: { contains: 'ZZ-TEST', mode: 'insensitive' } },
            { email: { contains: 'zz-test', mode: 'insensitive' } },
            { companyName: { contains: 'ZZ-TEST', mode: 'insensitive' } }
          ]
        }
      }
    }),
    projects: await prisma.project.count({
      where: {
        NOT: { name: { contains: 'ZZ-TEST', mode: 'insensitive' } }
      }
    }),
    prospects: await prisma.prospect.count({
      where: {
        NOT: {
          OR: [
            { companyName: { contains: 'ZZ-TEST', mode: 'insensitive' } },
            { contactName: { contains: 'ZZ-TEST', mode: 'insensitive' } },
            { email: { contains: 'zz-test', mode: 'insensitive' } }
          ]
        }
      }
    }),
    referrals: await prisma.referral.count({
      where: {
        NOT: {
          OR: [
            { companyName: { contains: 'ZZ-TEST', mode: 'insensitive' } },
            { contactName: { contains: 'ZZ-TEST', mode: 'insensitive' } }
          ]
        }
      }
    }),
    creditMovements: await prisma.creditMovement.count({
      where: {
        NOT: { description: { contains: 'ZZ-TEST', mode: 'insensitive' } }
      }
    })
  };
}

async function waitForHealth(port, maxWaitMs = 15000) {
  const start = Date.now();
  const url = `http://localhost:${port}/api/health`;

  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const body = await res.json();
        return body;
      }
    } catch {
      // Server not ready yet
    }
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error(`Timeout esperando que el servidor en puerto ${port} esté listo.`);
}

function runScript(scriptPath, envExtra = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n───────────────────────────────────────────────────────────────`);
    console.log(`🚀 Ejecutando suite: ${path.basename(scriptPath)}`);
    console.log(`───────────────────────────────────────────────────────────────`);

    const child = spawn('node', [scriptPath], {
      env: {
        ...process.env,
        ...envExtra,
      },
      stdio: 'inherit'
    });

    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Suite ${path.basename(scriptPath)} falló con código ${code}`));
      }
    });

    child.on('error', err => {
      reject(err);
    });
  });
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🛡️  RUNNER MAESTRO DE PRUEBAS E2E (HUMMINGX BI)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  assertSafeDb();

  if (!process.env.JWT_SECRET) {
    throw new Error('OPERACIÓN ABORTADA: JWT_SECRET no está configurada.');
  }

  // 1. Huellas criptográficas de usuarios protegidos ANTES
  console.log('🔒 1. Obteniendo huella criptográfica de usuarios protegidos (ANTES)...');
  const fpsBefore = await getProtectedFingerprints();
  for (const uid of Object.keys(fpsBefore)) {
    const f = fpsBefore[uid];
    console.log(`   • ${f.name} (${f.companyName}): ${f.hash.substring(0, 16)}...`);
  }

  // 2. Conteo de filas de datos reales no ZZ-TEST ANTES
  console.log('\n📊 2. Tomando conteo inicial de filas reales (no ZZ-TEST)...');
  const countsBefore = await getNonTestCounts();
  console.log('   ', JSON.stringify(countsBefore));

  // 3. Levantar servidor de pruebas en puerto 4010 con EMAIL_DRY_RUN='1'
  const TEST_PORT = '4010';
  console.log(`\n🌐 3. Levantando servidor API de prueba en puerto ${TEST_PORT} con EMAIL_DRY_RUN=1...`);
  const serverChild = spawn('node', ['api/index.js'], {
    env: {
      ...process.env,
      PORT: TEST_PORT,
      EMAIL_DRY_RUN: '1',
      EMAIL_AUTO_NOTIFICATIONS: '',
      CONFIRM_DB: 'yes',
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverChild.stderr.on('data', d => {
    const msg = d.toString();
    if (msg.includes('Error')) {
      console.error('[Server Err]', msg.trim());
    }
  });

  let allSuitesPassed = true;
  let suiteError = null;

  try {
    const health = await waitForHealth(TEST_PORT);
    console.log('✓ Servidor de prueba listo:', health);

    if (health.emailDryRun !== true) {
      throw new Error(`CRÍTICO: health.emailDryRun es ${health.emailDryRun}. Las pruebas deben ejecutarse en modo Dry-Run.`);
    }

    const testEnv = {
      API_BASE: `http://localhost:${TEST_PORT}/api`,
      PORT: TEST_PORT,
      EMAIL_DRY_RUN: '1',
      CONFIRM_DB: 'yes',
    };

    // 4. Ejecutar suites
    await runScript('api/_tests/e2e_admin.js', testEnv);
    await runScript('api/_tests/e2e_client.js', testEnv);
    await runScript('api/_tests/e2e_referrals.js', testEnv);

  } catch (err) {
    allSuitesPassed = false;
    suiteError = err;
    console.error('\n❌ ERROR EN LA EJECUCIÓN DE PRUEBAS:', err.message);
  } finally {
    // 5. Matar servidor de pruebas
    console.log('\n🛑 5. Deteniendo servidor de pruebas...');
    serverChild.kill('SIGTERM');

    // 6. Ejecutar script de limpieza de entidades ZZ-TEST
    console.log('\n🧹 6. Ejecutando limpieza exhaustiva de datos ZZ-TEST...');
    try {
      execSync('node api/_scripts/cleanup_zz_test.js', { stdio: 'inherit' });
    } catch (cleanupErr) {
      console.error('Error al ejecutar cleanup_zz_test:', cleanupErr.message);
    }

    // 7. Huellas criptográficas de usuarios protegidos DESPUÉS
    console.log('\n🔒 7. Verificando huella criptográfica de usuarios protegidos (DESPUÉS)...');
    const fpsAfter = await getProtectedFingerprints();
    let fingerprintsIdentical = true;

    for (const uid of Object.keys(fpsBefore)) {
      const b = fpsBefore[uid];
      const a = fpsAfter[uid];
      const match = a && a.hash === b.hash;
      console.log(`   • ${b.name}: ${match ? '✓ IDÉNTICA' : '✗ DIFIERE'} (${a?.hash?.substring(0, 16)}...)`);
      if (!match) fingerprintsIdentical = false;
    }

    if (!fingerprintsIdentical) {
      console.error('\n🚨 ALERTA CRÍTICA: La huella de los usuarios protegidos ha cambiado.');
      process.exit(1);
    }

    // 8. Verificar conteo de tablas no ZZ-TEST
    console.log('\n📊 8. Verificando integridad de conteos de tablas no ZZ-TEST...');
    const countsAfter = await getNonTestCounts();
    console.log('   ', JSON.stringify(countsAfter));
    let countsIntact = true;

    for (const table of Object.keys(countsBefore)) {
      const diff = countsAfter[table] - countsBefore[table];
      if (diff !== 0) {
        console.error(`   ✗ Tabla ${table}: diferencia de ${diff} filas detectada!`);
        countsIntact = false;
      } else {
        console.log(`   ✓ Tabla ${table}: 0 variación`);
      }
    }

    await prisma.$disconnect();

    if (!allSuitesPassed || !fingerprintsIdentical || !countsIntact) {
      console.error('\n💥 LAS PRUEBAS NO PASARON TODOS LOS CRITERIOS.');
      process.exit(1);
    } else {
      console.log('\n🎉 TODAS LAS SUITES PASARON AL 100% CON INTEGRIDAD TOTAL.');
      process.exit(0);
    }
  }
}

main().catch(err => {
  console.error('Fallo no capturado en el runner:', err);
  process.exit(1);
});
