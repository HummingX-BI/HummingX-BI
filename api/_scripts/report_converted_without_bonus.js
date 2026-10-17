// api/_scripts/report_converted_without_bonus.js
// Reporte SOLO LECTURA de recomendaciones 'converted' con creditsGenerated === 0 y sin CreditMovement.

require('dotenv').config({ path: 'api/.env' });
const prisma = require('../_src/lib/prisma');
const { isProtectedUser } = require('./protected');

async function runReport() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 REPORTE DE REFERIDOS CONVERTIDOS SIN CRÉDITOS OTORGADOS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    const list = await prisma.referral.findMany({
      where: {
        status: 'converted',
        creditsGenerated: 0,
        creditMovement: null,
      },
      include: {
        referrer: {
          select: { id: true, name: true, companyName: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Total encontrados: ${list.length}`);

    const protectedList = list.filter(r => isProtectedUser(r.referrer));
    const nonProtectedList = list.filter(r => !isProtectedUser(r.referrer));

    console.log(`• Vinculados a usuarios protegidos (JM Nutriólogo / Zammir): ${protectedList.length}`);
    if (protectedList.length > 0) {
      protectedList.forEach(r => {
        console.log(`   - ID: ${r.id} | Empresa: ${r.companyName} | Socio: ${r.referrer?.companyName || r.referrer?.name} (${r.referrer?.id})`);
      });
    }

    console.log(`• Vinculados a otros usuarios / pruebas: ${nonProtectedList.length}`);
    if (nonProtectedList.length > 0) {
      nonProtectedList.forEach(r => {
        console.log(`   - ID: ${r.id} | Empresa: ${r.companyName} | Socio: ${r.referrer?.companyName || r.referrer?.name} (${r.referrer?.id})`);
      });
    }

    console.log('\n✓ Reporte generado exitosamente (sin mutaciones).');
  } catch (err) {
    console.error('Error al generar el reporte:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runReport();
