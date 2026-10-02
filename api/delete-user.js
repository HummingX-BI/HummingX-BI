const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'emmancruz0831@gmail.com';
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      // Delete related records
      await prisma.projectActivity.deleteMany({ where: { projectId: { in: (await prisma.project.findMany({ where: { clientId: user.id } })).map(p => p.id) } } });
      await prisma.project.deleteMany({ where: { clientId: user.id } });
      await prisma.creditMovement.deleteMany({ where: { clientId: user.id } });
      await prisma.referral.deleteMany({ where: { referrerId: user.id } });
      // Finally delete the user
      await prisma.user.delete({ where: { email } });
      console.log(`Deleted user: ${email} and all related records.`);
    } else {
      console.log(`User not found: ${email}`);
    }
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}
main();
