require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  const client = await prisma.user.findFirst({ where: { role: 'client' } });

  if (!client) {
    console.log("No client found in DB to attach project/payments to.");
    return;
  }

  let project = await prisma.project.findFirst({ where: { clientId: client.id } });
  if (!project) {
    project = await prisma.project.create({
      data: {
        clientId: client.id,
        name: 'Tahara Café - Rediseño',
        description: 'Rediseño completo de marca y sitio web.',
        currentPhase: 3,
        progressPercent: 50,
      }
    });
    console.log("Created project for payments.");
  }

  // Check if payments exist
  const existingPayments = await prisma.payment.count();
  if (existingPayments > 0) {
    console.log(`Database already has ${existingPayments} payments.`);
    return;
  }

  await prisma.payment.createMany({
    data: [
      {
        projectId: project.id,
        title: 'Pago 1: Anticipo',
        description: 'Pago inicial correspondiente al arranque del proyecto.',
        amount: 2500,
        status: 'completed',
        dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      },
      {
        projectId: project.id,
        title: 'Pago 2: Intermedio',
        description: 'Pago correspondiente a la etapa de diseño aprobada.',
        amount: 5000,
        status: 'upcoming',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // In 5 days
      },
      {
        projectId: project.id,
        title: 'Pago 3: Finiquito',
        description: 'Pago final previo a entrega y despliegue del software.',
        amount: 2500,
        status: 'pending',
        dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // In 25 days
      }
    ]
  });

  console.log("Payments seeded successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
