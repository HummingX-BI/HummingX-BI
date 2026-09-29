const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.project.updateMany({
    where: { status: 'active' },
    data: {
      designLink: 'https://ejemplo-diseno-netlify.netlify.app'
    }
  });
  console.log(`Updated ${updated.count} projects with a design link.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
