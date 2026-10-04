const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding fake clients for analytics...');
  
  const mockClients = [
    { name: 'Empresa Alpha', email: 'alpha@test.com', phone: '1234567890', projectName: 'Dashboard Alpha', currentPhase: 2, progress: 30, daysAgo: 10, deliveryDays: 14 },
    { name: 'Beta Solutions', email: 'beta@test.com', phone: '1234567890', projectName: 'App Beta', currentPhase: 3, progress: 50, daysAgo: 6, deliveryDays: 3 },
    { name: 'Gamma Corp', email: 'gamma@test.com', phone: '1234567890', projectName: 'Web Gamma', currentPhase: 4, progress: 75, daysAgo: 3, deliveryDays: 7 },
    { name: 'Delta Analytics', email: 'delta@test.com', phone: '1234567890', projectName: 'Reportes Delta', currentPhase: 5, progress: 90, daysAgo: 1, deliveryDays: 1 },
    { name: 'Omega Global', email: 'omega@test.com', phone: '1234567890', projectName: 'Portal Omega', currentPhase: 3, progress: 40, daysAgo: 8, deliveryDays: -2 }, // Atorado
  ];

  for (const mc of mockClients) {
    const existing = await prisma.user.findUnique({ where: { email: mc.email } });
    if (existing) continue;

    const token = crypto.randomBytes(32).toString('hex');
    const referralCode = mc.name.toLowerCase().replace(/\s+/g, '-').slice(0, 10) + Math.floor(Math.random() * 1000);

    const user = await prisma.user.create({
      data: {
        name: mc.name,
        email: mc.email,
        companyName: mc.name,
        role: 'client',
        invitationToken: token,
        referralCode,
        active: true,
      }
    });

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - mc.daysAgo - 10); // created before
    
    const updatedAt = new Date();
    updatedAt.setDate(updatedAt.getDate() - mc.daysAgo);
    
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + mc.deliveryDays);

    await prisma.project.create({
      data: {
        clientId: user.id,
        name: mc.projectName,
        currentPhase: mc.currentPhase,
        progressPercent: mc.progress,
        createdAt: createdAt,
        updatedAt: updatedAt,
        estimatedDelivery: estimatedDelivery,
        status: 'active'
      }
    });
    
    console.log(`Created client ${mc.name} with project ${mc.projectName}`);
  }
  
  console.log('Done seeding!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
