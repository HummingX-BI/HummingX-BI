const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Load environment variables
const rootEnv = path.join(__dirname, '../../.env');
const apiEnv = path.join(__dirname, '../.env');
if (fs.existsSync(rootEnv)) {
  require('dotenv').config({ path: rootEnv });
} else if (fs.existsSync(apiEnv)) {
  require('dotenv').config({ path: apiEnv });
} else {
  require('dotenv').config();
}

const prisma = require('../_src/lib/prisma');

async function main() {
  console.log('🚀 Creando/actualizando usuario operador NFC Samuel...');

  const passwordHash = await bcrypt.hash('SamuelNFC2026!', 12);

  const emailsToConfigure = [
    { email: 'samuel@hummingxbi.com', name: 'Samuel Ador' },
    { email: 'samuel.ador@hummingxbi.com', name: 'Samuel Ador' }
  ];

  for (const item of emailsToConfigure) {
    const user = await prisma.user.upsert({
      where: { email: item.email },
      update: {
        name: item.name,
        passwordHash,
        role: 'nfc_operator',
        active: true,
        invitationAccepted: true,
        companyName: 'HummingX BI',
      },
      create: {
        name: item.name,
        email: item.email,
        passwordHash,
        role: 'nfc_operator',
        active: true,
        invitationAccepted: true,
        companyName: 'HummingX BI',
      }
    });

    console.log(`✅ Usuario configurado con éxito:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Nombre: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Rol: ${user.role}`);
    console.log(`   Activo: ${user.active}`);
  }

  console.log('\n🔒 Verificando hashing de contraseña:');
  const testUser = await prisma.user.findUnique({ where: { email: 'samuel@hummingxbi.com' } });
  const isMatch = await bcrypt.compare('SamuelNFC2026!', testUser.passwordHash);
  console.log(`   Match password 'SamuelNFC2026!': ${isMatch ? 'CORRECTO ✅' : 'FALLIDO ❌'}`);
}

main()
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
