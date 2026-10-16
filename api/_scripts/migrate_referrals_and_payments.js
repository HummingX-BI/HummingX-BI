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

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
  // If 5-digit pool has collisions, use 6-digit
  while (true) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    if (!existingCodes.has(code)) {
      existingCodes.add(code);
      return code;
    }
  }
}

async function migrate() {
  console.log('🔄 Iniciando migración de códigos de socio y pagos...');

  // 1. Migrar códigos de usuario a 5 dígitos
  const users = await prisma.user.findMany();
  const existingCodes = new Set(
    users.map(u => u.referralCode).filter(c => c && /^\d{5,6}$/.test(c))
  );

  console.log(`📋 Total de usuarios a evaluar: ${users.length}`);

  for (const user of users) {
    const currentCode = user.referralCode;
    const isAlreadyNumeric = currentCode && /^\d{5,6}$/.test(currentCode);

    if (isAlreadyNumeric) {
      console.log(`   ✓ Usuario ${user.email} ya cuenta con código numérico: ${currentCode}`);
      continue;
    }

    const newNumericCode = await generateUnique5DigitCode(existingCodes);
    const legacyCode = currentCode || null;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        referralCode: newNumericCode,
        legacyReferralCode: legacyCode,
      },
    });

    console.log(`   ✨ Migrado ${user.email}: ${legacyCode || '(sin código)'} -> Nuevo: ${newNumericCode} (Legacy: ${legacyCode})`);
  }

  // 2. Vincular CreditMovement histórico con Referral histórico
  const convertedReferrals = await prisma.referral.findMany({
    where: { status: 'converted', creditsGenerated: { gt: 0 } },
  });

  for (const ref of convertedReferrals) {
    const existingMovement = await prisma.creditMovement.findFirst({
      where: {
        clientId: ref.referrerId,
        type: 'referral_converted',
        description: { contains: ref.companyName },
      },
    });

    if (existingMovement && !existingMovement.referralId) {
      await prisma.creditMovement.update({
        where: { id: existingMovement.id },
        data: { referralId: ref.id },
      });
      console.log(`   🔗 Vinculado CreditMovement ${existingMovement.id} con Referral ${ref.id} (${ref.companyName})`);
    }
  }

  // 3. Backfill Payment.paidAt desde updatedAt para pagos completados
  const completedPayments = await prisma.payment.findMany({
    where: { status: 'completed', paidAt: null },
  });

  console.log(`💳 Pagos completados pendientes de paidAt: ${completedPayments.length}`);
  for (const payment of completedPayments) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { paidAt: payment.updatedAt },
    });
    console.log(`   ✓ Pago ${payment.id} (${payment.title}) actualizado paidAt = ${payment.updatedAt.toISOString()}`);
  }

  // 4. Recalcular niveles de usuarios según referidos 'converted'
  for (const user of users) {
    const convertedCount = await prisma.referral.count({
      where: { referrerId: user.id, status: 'converted' },
    });
    const calculatedLevel = convertedCount >= 10 ? 3 : convertedCount >= 5 ? 2 : 1;
    if (user.level !== calculatedLevel) {
      await prisma.user.update({
        where: { id: user.id },
        data: { level: calculatedLevel },
      });
      console.log(`   📈 Nivel actualizado para ${user.email}: ${user.level} -> ${calculatedLevel} (${convertedCount} cerrados)`);
    }
  }

  console.log('✅ Migración completada exitosamente.');
}

migrate()
  .catch((err) => {
    console.error('❌ Error en migración:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
