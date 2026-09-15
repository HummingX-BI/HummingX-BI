require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../src/lib/prisma');

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Create admin user
  const passwordHash = await bcrypt.hash('HummingX2024!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hummingxbi.com' },
    update: {},
    create: {
      name: 'Admin HummingX',
      email: 'admin@hummingxbi.com',
      passwordHash,
      role: 'admin',
      companyName: 'HummingX BI',
      invitationAccepted: true,
      active: true,
    }
  });

  console.log(`✅ Admin creado: ${admin.email}`);
  console.log(`   Password: HummingX2024! (¡CAMBIA ESTO INMEDIATAMENTE!)\n`);

  // Create demo client
  const clientHash = await bcrypt.hash('demo1234', 12);
  const client = await prisma.user.upsert({
    where: { email: 'demo@tahara.cafe' },
    update: {},
    create: {
      name: 'Tahara Café',
      email: 'demo@tahara.cafe',
      passwordHash: clientHash,
      role: 'client',
      companyName: 'Tahara Café',
      phone: '+52 55 1234 5678',
      referralCode: 'tahara-cafe',
      level: 2,
      invitationAccepted: true,
      active: true,
    }
  });

  console.log(`✅ Cliente demo: ${client.email}`);
  console.log(`   Password: demo1234\n`);

  // Create demo project
  const project = await prisma.project.upsert({
    where: { id: 'demo-project-id-001' },
    update: {},
    create: {
      id: 'demo-project-id-001',
      clientId: client.id,
      name: 'Página Web + Menú Digital',
      description: 'Diseño de experiencia interactiva y plataforma digital personalizada para la carta de Tahara Café con integración directa a pedidos.',
      currentPhase: 3,
      progressPercent: 65,
      status: 'active',
      estimatedDelivery: new Date('2026-10-01'),
      internalNotes: 'Cliente puntual. Feedback muy claro. Prefiere reuniones por WhatsApp.',
    }
  });

  // Add demo activities
  await prisma.projectActivity.createMany({
    skipDuplicates: true,
    data: [
      {
        projectId: project.id,
        authorId: admin.id,
        description: 'Proyecto iniciado. Se definió el alcance y los objetivos principales.',
        type: 'milestone',
        createdAt: new Date('2026-09-01'),
      },
      {
        projectId: project.id,
        authorId: admin.id,
        description: 'Diseño aprobado. Los flujos de navegación y la identidad visual fueron validados.',
        type: 'milestone',
        createdAt: new Date('2026-09-08'),
      },
      {
        projectId: project.id,
        authorId: admin.id,
        description: 'Proyecto avanzó a Fase 3: Desarrollo. Iniciamos la construcción del sitio web.',
        type: 'update',
        createdAt: new Date('2026-09-10'),
      },
      {
        projectId: project.id,
        authorId: admin.id,
        description: 'Se completó la integración del menú digital con las categorías principales.',
        type: 'delivery',
        createdAt: new Date('2026-09-13'),
      },
    ]
  });

  // Add demo credits
  await prisma.creditMovement.createMany({
    skipDuplicates: true,
    data: [
      {
        clientId: client.id,
        amount: 500,
        type: 'welcome_bonus',
        description: 'Bono de bienvenida HummingX',
        createdAt: new Date('2026-09-01'),
      },
      {
        clientId: client.id,
        amount: 2000,
        type: 'referral_converted',
        description: 'Recomendación exitosa — Restaurante XYZ',
        createdAt: new Date('2026-09-10'),
      },
    ]
  });

  // Add demo referral
  await prisma.referral.create({
    data: {
      referrerId: client.id,
      companyName: 'Restaurante XYZ',
      contactName: 'Roberto Mendoza',
      contactEmail: 'roberto@xyz.com',
      status: 'converted',
      creditsGenerated: 2000,
      createdAt: new Date('2026-09-05'),
    }
  }).catch(() => {}); // Skip if already exists

  console.log(`✅ Proyecto demo y actividades creadas\n`);
  console.log('🎉 Seed completado exitosamente!');
  console.log('\nCredenciales para probar:');
  console.log('  Admin: admin@hummingxbi.com / HummingX2024!');
  console.log('  Cliente: demo@tahara.cafe / demo1234');
}

seed()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
