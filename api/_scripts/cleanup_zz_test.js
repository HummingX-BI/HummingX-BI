// api/_scripts/cleanup_zz_test.js
const prisma = require('../_src/lib/prisma');
const { isProtectedUser } = require('./protected');

async function cleanupAllZzTest() {
  console.log('🧹 Limpiando cualquier registro huérfano con prefijo ZZ-TEST...');

  // 1. Users
  const testUsers = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: 'ZZ-TEST', mode: 'insensitive' } },
        { email: { contains: 'zz-test', mode: 'insensitive' } },
        { companyName: { contains: 'ZZ-TEST', mode: 'insensitive' } },
      ]
    }
  });

  for (const u of testUsers) {
    if (isProtectedUser(u)) {
      throw new Error(`CRITICAL: Usuario protegido detectado en cleanup: ${u.email}`);
    }
    console.log(`Eliminando usuario de prueba: ${u.name} (${u.email})`);
    const projects = await prisma.project.findMany({ where: { clientId: u.id } });
    for (const pr of projects) {
      await prisma.payment.deleteMany({ where: { projectId: pr.id } });
      await prisma.projectActivity.deleteMany({ where: { projectId: pr.id } });
      await prisma.project.delete({ where: { id: pr.id } });
    }
    await prisma.creditMovement.deleteMany({ where: { clientId: u.id } });
    await prisma.referral.deleteMany({ where: { referrerId: u.id } });
    await prisma.portalSession.deleteMany({ where: { userId: u.id } });
    await prisma.loginEvent.deleteMany({ where: { userId: u.id } });
    await prisma.pageView.deleteMany({ where: { userId: u.id } });
    await prisma.user.delete({ where: { id: u.id } });
  }

  // 2. Prospects
  const testProspects = await prisma.prospect.findMany({
    where: {
      OR: [
        { companyName: { contains: 'ZZ-TEST', mode: 'insensitive' } },
        { contactName: { contains: 'ZZ-TEST', mode: 'insensitive' } },
        { email: { contains: 'zz-test', mode: 'insensitive' } },
      ]
    }
  });
  for (const p of testProspects) {
    if (isProtectedUser(p)) continue;
    await prisma.prospectDocument.deleteMany({ where: { prospectId: p.id } });
    await prisma.prospect.delete({ where: { id: p.id } });
  }

  // 3. Appointments
  await prisma.appointment.deleteMany({
    where: {
      OR: [
        { title: { contains: 'ZZ-TEST', mode: 'insensitive' } },
        { companyName: { contains: 'ZZ-TEST', mode: 'insensitive' } },
      ]
    }
  });

  // 4. Tasks
  await prisma.teamTask.deleteMany({
    where: { title: { contains: 'ZZ-TEST', mode: 'insensitive' } }
  });

  // 5. Expenses
  await prisma.expense.deleteMany({
    where: { title: { contains: 'ZZ-TEST', mode: 'insensitive' } }
  });

  // 6. NFC Cards
  await prisma.nfcCard.deleteMany({
    where: {
      OR: [
        { clientName: { contains: 'ZZ-TEST', mode: 'insensitive' } },
        { notes: { contains: 'ZZ-TEST', mode: 'insensitive' } },
      ]
    }
  });

  // 7. Referrals
  await prisma.referral.deleteMany({
    where: {
      OR: [
        { companyName: { contains: 'ZZ-TEST', mode: 'insensitive' } },
        { contactName: { contains: 'ZZ-TEST', mode: 'insensitive' } },
      ]
    }
  });

  console.log('✓ Limpieza total de ZZ-TEST finalizada.');
  process.exit(0);
}

cleanupAllZzTest().catch(err => {
  console.error('Error en cleanup:', err);
  process.exit(1);
});
