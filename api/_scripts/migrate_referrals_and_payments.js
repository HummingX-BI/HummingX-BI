require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { isProtectedUser } = require('./protected');

const prisma = new PrismaClient();
const isDryRun = process.argv.includes('--dry-run');

function printDbHost() {
  const url = process.env.DATABASE_URL || '';
  try {
    const parsed = new URL(url);
    console.log(`🔌 Base de datos objetivo: ${parsed.protocol}//${parsed.host}${parsed.pathname}`);
  } catch (_) {
    console.log('🔌 Base de datos objetivo: [DATABASE_URL no parseable]');
  }
}

if (process.env.CONFIRM_DB !== 'yes' && !isDryRun) {
  printDbHost();
  console.log('Define CONFIRM_DB=yes o ejecuta con --dry-run');
  process.exit(1);
}
printDbHost();
if (isDryRun) {
  console.log('🔍 MODO --dry-run ACTIVO: no se escribirá ningún cambio en la base de datos.');
}

async function generateUnique5DigitCode(existingCodes) {
  let attempts = 0;
  while (attempts < 50) {
    attempts++;
    const code = String(Math.floor(10000 + Math.random() * 90000));
    if (!existingCodes.has(code)) {
      existingCodes.add(code);
      return code;
    }
  }
  while (true) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    if (!existingCodes.has(code)) {
      existingCodes.add(code);
      return code;
    }
  }
}

async function migrate() {
  console.log('🔄 Iniciando migración de códigos de socio y pagos (excluyendo protegidos)...');

  // 1. Migrar códigos de usuario a 5 dígitos (excluyendo protegidos)
  const users = await prisma.user.findMany();
  const existingCodes = new Set(
    users.map(u => u.referralCode).filter(c => c && /^\d{5,6}$/.test(c))
  );

  console.log(`📋 Total de usuarios evaluados: ${users.length}`);
  let usersToMigrate = 0;

  for (const user of users) {
    if (isProtectedUser(user)) {
      console.log(`   🛡️ Protegido omitido: ${user.name || user.email} (${user.id})`);
      continue;
    }

    const currentCode = user.referralCode;
    const isAlreadyNumeric = currentCode && /^\d{5,6}$/.test(currentCode);

    if (isAlreadyNumeric) {
      console.log(`   ✓ Usuario ${user.email} ya cuenta con código numérico: ${currentCode}`);
      continue;
    }

    usersToMigrate++;
    const newNumericCode = await generateUnique5DigitCode(existingCodes);
    const legacyCode = currentCode || null;

    if (!isDryRun) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          referralCode: newNumericCode,
          legacyReferralCode: legacyCode,
        },
      });
      console.log(`   ✨ Migrado ${user.email}: ${legacyCode || '(sin código)'} -> Nuevo: ${newNumericCode}`);
    } else {
      console.log(`   [DRY-RUN] Migraría ${user.email}: ${legacyCode || '(sin código)'} -> ${newNumericCode}`);
    }
  }

  // 2. Vincular CreditMovement histórico con Referral histórico (excluyendo protegidos)
  const convertedReferrals = await prisma.referral.findMany({
    where: { status: 'converted', creditsGenerated: { gt: 0 } },
  });

  let creditMovementsToLink = 0;
  for (const ref of convertedReferrals) {
    if (isProtectedUser(ref.referrerId)) {
      continue;
    }

    const existingMovement = await prisma.creditMovement.findFirst({
      where: {
        clientId: ref.referrerId,
        type: 'referral_converted',
        description: { contains: ref.companyName },
      },
    });

    if (existingMovement && !existingMovement.referralId) {
      creditMovementsToLink++;
      if (!isDryRun) {
        await prisma.creditMovement.update({
          where: { id: existingMovement.id },
          data: { referralId: ref.id },
        });
        console.log(`   🔗 Vinculado CreditMovement ${existingMovement.id} con Referral ${ref.id}`);
      } else {
        console.log(`   [DRY-RUN] Vincularía CreditMovement ${existingMovement.id} con Referral ${ref.id}`);
      }
    }
  }

  // 3. Backfill Payment.paidAt desde updatedAt para pagos completados (excluyendo pagos de protegidos)
  const completedPayments = await prisma.payment.findMany({
    where: { status: 'completed', paidAt: null },
    include: { project: true }
  });

  let paymentsToBackfill = 0;
  for (const payment of completedPayments) {
    if (isProtectedUser(payment.project?.clientId)) {
      console.log(`   🛡️ Pago protegido omitido: ${payment.id} de cliente ${payment.project?.clientId}`);
      continue;
    }

    paymentsToBackfill++;
    if (!isDryRun) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { paidAt: payment.updatedAt },
      });
      console.log(`   ✓ Pago ${payment.id} actualizado paidAt = ${payment.updatedAt.toISOString()}`);
    } else {
      console.log(`   [DRY-RUN] Actualizaría pago ${payment.id} paidAt = ${payment.updatedAt.toISOString()}`);
    }
  }

  // 4. Recalcular niveles de usuarios (excluyendo protegidos)
  let levelsToUpdate = 0;
  for (const user of users) {
    if (isProtectedUser(user)) {
      continue;
    }

    const convertedCount = await prisma.referral.count({
      where: { referrerId: user.id, status: 'converted' },
    });
    const calculatedLevel = convertedCount >= 10 ? 3 : convertedCount >= 5 ? 2 : 1;
    if (user.level !== calculatedLevel) {
      levelsToUpdate++;
      if (!isDryRun) {
        await prisma.user.update({
          where: { id: user.id },
          data: { level: calculatedLevel },
        });
        console.log(`   📈 Nivel actualizado para ${user.email}: ${user.level} -> ${calculatedLevel}`);
      } else {
        console.log(`   [DRY-RUN] Nivel cambiaría para ${user.email}: ${user.level} -> ${calculatedLevel}`);
      }
    }
  }

  console.log('\n📊 Resumen de migración:');
  console.log(`   • Usuarios para migrar código: ${usersToMigrate}`);
  console.log(`   • Movimientos de crédito para vincular: ${creditMovementsToLink}`);
  console.log(`   • Pagos para backfill paidAt: ${paymentsToBackfill}`);
  console.log(`   • Niveles de socio para actualizar: ${levelsToUpdate}`);
  console.log(isDryRun ? '✅ Dry-run completado sin errores.' : '✅ Migración completada exitosamente.');
}

migrate()
  .catch((err) => {
    console.error('❌ Error en migración:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
