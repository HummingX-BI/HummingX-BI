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

  async function safeFetch(modelName, tableName) {
    try {
      return await prisma[modelName].findMany();
    } catch (e) {
      if (e.code === 'P2022' || e.code === 'P2021') {
        try {
          return await prisma.$queryRawUnsafe(`SELECT * FROM "${tableName}"`);
        } catch (rawErr) {
          console.warn(`Aviso: tabla ${tableName} no encontrada o vacia:`, rawErr.message);
          return [];
        }
      }
      throw e;
    }
  }

  const data = {
    metadata: {
      timestamp: new Date().toISOString(),
      databaseUrlSource: process.env.DATABASE_URL ? 'configured' : 'missing'
    },
    users: await safeFetch('user', 'users'),
    loginEvents: await safeFetch('loginEvent', 'login_events'),
    pageViews: await safeFetch('pageView', 'page_views'),
    projects: await safeFetch('project', 'projects'),
    projectActivities: await safeFetch('projectActivity', 'project_activities'),
    referrals: await safeFetch('referral', 'referrals'),
    creditMovements: await safeFetch('creditMovement', 'credit_movements'),
    payments: await safeFetch('payment', 'payments'),
    proposals: await safeFetch('proposal', 'proposals'),
    prospects: await safeFetch('prospect', 'prospects'),
    prospectDocuments: await safeFetch('prospectDocument', 'prospect_documents'),
    appointments: await safeFetch('appointment', 'appointments'),
    teamTasks: await safeFetch('teamTask', 'team_tasks'),
    historicalDeals: await safeFetch('historicalDeal', 'historical_deals'),
    nfcCards: await safeFetch('nfcCard', 'nfc_cards'),
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
