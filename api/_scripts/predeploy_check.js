const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

// Load environment variables (.env in workspace root or api/.env)
const rootEnv = path.join(__dirname, '../../.env');
const apiEnv = path.join(__dirname, '../.env');
if (fs.existsSync(rootEnv)) {
  require('dotenv').config({ path: rootEnv });
} else if (fs.existsSync(apiEnv)) {
  require('dotenv').config({ path: apiEnv });
} else {
  require('dotenv').config();
}

async function runCheck() {
  console.log('=== VERIFICACION PREVIA AL DESPLIEGUE (SOLO LECTURA) ===\n');

  // (a) Imprimir host de DATABASE_URL sin credenciales
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('ERROR: Variable DATABASE_URL no definida en el entorno.');
    process.exit(1);
  }

  try {
    const parsed = new URL(dbUrl);
    const host = parsed.host;
    const dbName = parsed.pathname.replace(/^\//, '');
    console.log(`[Base de Datos] Host conectado: ${host}`);
    console.log(`[Base de Datos] Nombre de base: ${dbName}\n`);
  } catch (err) {
    console.log('[Base de Datos] No se pudo parsear el formato de DATABASE_URL.');
  }

  let isDesynced = false;

  // (b) Ejecutar prisma migrate diff
  console.log('[Verificación de Schema] Comparando datasource contra datamodel...');
  try {
    const rootDir = path.join(__dirname, '../..');
    const diffOutput = execSync(
      'npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script',
      { cwd: rootDir, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim();

    const isEmpty = !diffOutput || diffOutput === '-- This is an empty migration' || diffOutput.replace(/--[^\n]*/g, '').trim().length === 0;

    if (!isEmpty) {
      isDesynced = true;
      console.log('------------------------------------------------------------');
      console.log('BD DESINCRONIZADA: falta npx prisma db push');
      console.log('------------------------------------------------------------');

      if (/\bDROP\b/i.test(diffOutput)) {
        console.error('PELIGRO: contiene DROP, no ejecutar db push sin revision manual.');
      }

      console.log('Diferencias detectadas (DDL pendiente):');
      const lines = diffOutput.split('\n');
      lines.forEach(line => {
        const trimmed = line.trim();
        if (
          trimmed.startsWith('CREATE TABLE') ||
          trimmed.startsWith('ALTER TABLE') ||
          trimmed.startsWith('DROP') ||
          trimmed.startsWith('ADD COLUMN')
        ) {
          console.log(`  • ${trimmed}`);
        }
      });
      console.log('');
    } else {
      console.log('Schema de Prisma y Base de Datos sincronizados (sin migraciones pendientes).\n');
    }
  } catch (diffErr) {
    console.error('Error al ejecutar prisma migrate diff:', diffErr.message);
    isDesynced = true;
  }

  // (c) Conteo de registros existentes (SOLO LECTURA)
  console.log('[Conteo de Registros]');
  const prisma = new PrismaClient();

  try {
    try {
      const clientsCount = await prisma.user.count({ where: { role: 'client' } });
      console.log(`  • Clientes (users role 'client'): ${clientsCount}`);
    } catch (e) {
      console.log(`  • Clientes: Error al contar (${e.message})`);
    }

    try {
      const projectsCount = await prisma.project.count();
      console.log(`  • Proyectos: ${projectsCount}`);
    } catch (e) {
      console.log(`  • Proyectos: Error al contar (${e.message})`);
    }

    try {
      const prospectsCount = await prisma.prospect.count();
      console.log(`  • Prospectos CRM: ${prospectsCount}`);
    } catch (e) {
      console.log(`  • Prospectos CRM: Error al contar (${e.message})`);
    }

    try {
      const nfcCardsCount = await prisma.nfcCard.count();
      console.log(`  • Tarjetas NFC/QR: ${nfcCardsCount}`);
    } catch (e) {
      console.log(`  • Tarjetas NFC/QR: Error al contar (${e.message})`);
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n============================================================');
  if (isDesynced) {
    console.log('ESTADO: Base de datos desincronizada con schema.prisma.');
    console.log('Acción requerida antes de desplegar: npx prisma db push');
    process.exit(1);
  } else {
    console.log('ESTADO: Verificación completada con éxito. Base de datos lista.');
    process.exit(0);
  }
}

runCheck().catch(err => {
  console.error('Fallo inesperado en predeploy_check:', err);
  process.exit(1);
});
