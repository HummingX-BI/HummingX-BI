/**
 * tracking.smoke.js — Smoke test for PortalSession & Heartbeat Activity Tracking
 * Run: CONFIRM_DB=yes node api/_tests/tracking.smoke.js
 */

require('dotenv').config();

function printDbHost() {
  const url = process.env.DATABASE_URL || '';
  try {
    const parsed = new URL(url);
    console.log(`🔌 Base de datos objetivo: ${parsed.protocol}//${parsed.host}${parsed.pathname}`);
  } catch (_) {
    console.log('🔌 Base de datos objetivo: [DATABASE_URL no parseable]');
  }
}

if (process.env.CONFIRM_DB !== 'yes') {
  printDbHost();
  console.log('Define CONFIRM_DB=yes y apunta DATABASE_URL a la BD correcta');
  process.exit(1);
}
printDbHost();

const assert = require('assert');
const prisma = require('../_src/lib/prisma');

async function simulateHeartbeat({ userId, sessionId, rawActiveSec, path, deviceType = 'desktop' }) {
  const parsed = parseInt(rawActiveSec, 10);
  const activeSec = Math.max(1, Math.min(30, isNaN(parsed) ? 15 : parsed));

  await prisma.$transaction([
    prisma.portalSession.upsert({
      where: { id: sessionId },
      create: {
        id: sessionId,
        userId,
        startedAt: new Date(),
        lastSeenAt: new Date(),
        activeSec,
        deviceType,
        entryPath: path,
      },
      update: {
        activeSec: { increment: activeSec },
        lastSeenAt: new Date(),
      }
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        totalTimeSpent: { increment: activeSec }
      }
    })
  ]);
}

async function runTrackingSmokeTest() {
  console.log('🧪 Iniciando Smoke Test de Tracking de Actividad (PortalSession)...\n');
  const testEmail = `smoke.tracking.${Date.now()}@hummingx.test`;
  const sessionId = `smoke_session_${Date.now()}`;
  let testUser = null;

  try {
    // 1. Crear usuario de prueba
    console.log('▶ [1/4] Creando usuario de prueba...');
    testUser = await prisma.user.create({
      data: {
        name: 'Smoke Tracking User',
        email: testEmail,
        role: 'client',
        totalTimeSpent: 0,
      }
    });
    assert.strictEqual(testUser.totalTimeSpent, 0, 'totalTimeSpent inicial debe ser 0');

    // 2. Ejecutar 3 heartbeats con 20s, 50s (clamp a 30s) y 10s
    console.log('▶ [2/4] Enviando heartbeat 1 (20s)...');
    await simulateHeartbeat({ userId: testUser.id, sessionId, rawActiveSec: 20, path: '/dashboard' });

    console.log('▶ [3/4] Enviando heartbeat 2 (50s -> debe clampear a 30s)...');
    await simulateHeartbeat({ userId: testUser.id, sessionId, rawActiveSec: 50, path: '/project' });

    console.log('▶ [4/4] Enviando heartbeat 3 (10s)...');
    await simulateHeartbeat({ userId: testUser.id, sessionId, rawActiveSec: 10, path: '/pagos' });

    // 3. Validar resultados en base de datos
    const session = await prisma.portalSession.findUnique({
      where: { id: sessionId }
    });
    assert.ok(session, 'La sesión de portal debe existir');
    assert.strictEqual(session.activeSec, 60, `activeSec en sesión debe ser 60 (20 + 30 + 10), se obtuvo: ${session.activeSec}`);

    const updatedUser = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: { totalTimeSpent: true }
    });
    assert.strictEqual(updatedUser.totalTimeSpent, 60, `totalTimeSpent debe ser 60, se obtuvo: ${updatedUser.totalTimeSpent}`);

    console.log('\n✅ Tracking Smoke Test exitoso: PortalSession.activeSec=60 y user.totalTimeSpent=60');
  } catch (err) {
    console.error('\n❌ Error en Smoke Test de tracking:', err);
    process.exit(1);
  } finally {
    // 4. Limpieza absoluta
    console.log('🧹 Limpiando registros de prueba...');
    try {
      await prisma.portalSession.deleteMany({ where: { id: sessionId } });
      if (testUser) {
        await prisma.user.delete({ where: { id: testUser.id } });
      }
      console.log('✨ Limpieza completada.');
    } catch (cleanupErr) {
      console.error('Error durante limpieza:', cleanupErr.message);
    }
    await prisma.$disconnect();
  }
}

runTrackingSmokeTest();
