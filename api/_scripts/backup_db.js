const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function backup() {
  console.log('🔄 Iniciando respaldo de la base de datos...');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '../../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const data = {
    metadata: {
      timestamp: new Date().toISOString(),
      databaseUrlSource: process.env.DATABASE_URL ? 'configured' : 'missing'
    },
    users: await prisma.user.findMany(),
    loginEvents: await prisma.loginEvent.findMany(),
    pageViews: await prisma.pageView.findMany(),
    projects: await prisma.project.findMany(),
    projectActivities: await prisma.projectActivity.findMany(),
    referrals: await prisma.referral.findMany(),
    creditMovements: await prisma.creditMovement.findMany(),
    payments: await prisma.payment.findMany(),
    proposals: await prisma.proposal.findMany(),
    prospects: await prisma.prospect.findMany(),
    prospectDocuments: await prisma.prospectDocument.findMany(),
    appointments: await prisma.appointment.findMany(),
    teamTasks: await prisma.teamTask.findMany(),
    historicalDeals: await prisma.historicalDeal.findMany(),
    nfcCards: await prisma.nfcCard.findMany(),
  };

  const filePath = path.join(backupDir, `backup_${timestamp}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

  const stats = {
    users: data.users.length,
    projects: data.projects.length,
    referrals: data.referrals.length,
    creditMovements: data.creditMovements.length,
    payments: data.payments.length,
    prospects: data.prospects.length,
    appointments: data.appointments.length,
    teamTasks: data.teamTasks.length,
    nfcCards: data.nfcCards.length,
  };

  console.log('✅ Respaldo completado exitosamente:');
  console.log(`   Archivo: ${filePath}`);
  console.log('   Estadísticas:', JSON.stringify(stats, null, 2));
}

backup()
  .catch((err) => {
    console.error('❌ Error realizando respaldo:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
