const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'emmancruz0831@gmail.com';
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: { projects: true }
  });

  if (!user) {
    console.log(`User ${email} not found.`);
    return;
  }

  for (const project of user.projects) {
    await prisma.projectActivity.deleteMany({ where: { projectId: project.id } });
    await prisma.project.delete({ where: { id: project.id } });
  }
  
  await prisma.creditMovement.deleteMany({ where: { clientId: user.id } });
  await prisma.referral.deleteMany({ where: { referrerId: user.id } });
  await prisma.projectActivity.deleteMany({ where: { authorId: user.id } });

  await prisma.user.delete({
    where: { email }
  });

  console.log(`Deleted user ${email} successfully.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
