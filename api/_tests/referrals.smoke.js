/**
 * referrals.smoke.js — Smoke test for HummingX Referral & Credit System
 * Run: node api/_tests/referrals.smoke.js
 */

const assert = require('assert');
const prisma = require('../_src/lib/prisma');
const referralService = require('../_src/services/referralService');

async function runSmokeTest() {
  console.log('🧪 Iniciando Smoke Test de Referidos y Créditos HX...\n');
  const testEmail = `smoke.partner.${Date.now()}@hummingx.test`;
  let testUser = null;
  const createdProspectIds = [];
  const createdReferralIds = [];
  const createdMovementIds = [];

  try {
    // -------------------------------------------------------------
    // 1. Cliente genera código numérico de 5 dígitos
    // -------------------------------------------------------------
    console.log('▶ [1/6] Creando usuario de prueba y asignando código numérico...');
    const numericCode = await referralService.generateNumericReferralCode(prisma);
    assert.match(numericCode, /^\d{5,6}$/, 'El código debe tener 5 o 6 dígitos numéricos');

    testUser = await prisma.user.create({
      data: {
        name: 'Socio Test Smoke',
        email: testEmail,
        companyName: 'Empresa Test Socio',
        role: 'client',
        referralCode: numericCode,
        legacyReferralCode: 'smoke-legacy-slug',
        level: 1,
        active: true,
      }
    });

    console.log(`   ✓ Usuario creado: ${testUser.email} con código numérico: ${testUser.referralCode}`);

    // Probar lookup con código limpio, con prefijo HX- y con slug legacy
    const foundByCode = await referralService.findReferrerByCode(numericCode, prisma);
    assert.strictEqual(foundByCode?.id, testUser.id, 'Debe encontrar usuario por código numérico');

    const foundByHx = await referralService.findReferrerByCode(`HX-${numericCode}`, prisma);
    assert.strictEqual(foundByHx?.id, testUser.id, 'Debe encontrar usuario por código con prefijo HX-');

    const foundByLegacy = await referralService.findReferrerByCode('smoke-legacy-slug', prisma);
    assert.strictEqual(foundByLegacy?.id, testUser.id, 'Debe encontrar usuario por slug legacy');

    console.log('   ✓ Búsqueda por código numérico, HX- y legacy slug verificada.');

    // -------------------------------------------------------------
    // 2. Recomendación desde portal cliente nace como Prospect con código y referralId
    // -------------------------------------------------------------
    console.log('\n▶ [2/6] Registrando recomendación desde el portal...');
    const clientRefResult = await referralService.createClientReferral({
      referrerId: testUser.id,
      companyName: 'Clínica Dental Smoke A',
      contactName: 'Dra. Patricia',
      contactEmail: 'patricia@dental.test',
      notes: 'Interesados en pantallas y citas',
    });

    const clientRef = clientRefResult.referral;
    const clientProspect = clientRefResult.prospect;
    createdReferralIds.push(clientRef.id);
    createdProspectIds.push(clientProspect.id);

    assert.strictEqual(clientProspect.referralCode, testUser.referralCode, 'Prospect debe tener el referralCode del socio');
    assert.strictEqual(clientProspect.referralId, clientRef.id, 'Prospect debe tener el referralId vinculado');
    assert.strictEqual(clientRef.status, 'registered', 'Referral debe nacer en status registered');
    console.log(`   ✓ Referral (${clientRef.id}) y Prospect (${clientProspect.id}) creados y vinculados exitosamente.`);

    // -------------------------------------------------------------
    // 3. Admin asigna créditos (award-referral-credits) en transacción
    // -------------------------------------------------------------
    console.log('\n▶ [3/6] Otorgando créditos por cierre comercial (Won -> Award)...');
    const awardResult = await referralService.awardCredits({
      prospectId: clientProspect.id,
      referralId: clientRef.id,
      reason: 'Bono por recomendación exitosa Smoke Test',
    });

    createdMovementIds.push(awardResult.movement.id);

    assert.strictEqual(awardResult.success, true, 'Award debe retornar success');
    assert.strictEqual(awardResult.amount, 1500, 'Nivel 1 Member debe otorgar $1,500 MXN');
    assert.strictEqual(awardResult.movement.referralId, clientRef.id, 'Movement debe tener referralId asignado');

    // Verificar en BD que referral se actualizó a converted y creditsGenerated = 1500
    const refInDb = await prisma.referral.findUnique({ where: { id: clientRef.id } });
    assert.strictEqual(refInDb.status, 'converted', 'Referral status debe ser converted');
    assert.strictEqual(refInDb.creditsGenerated, 1500, 'creditsGenerated debe ser 1500');

    // Verificar saldo acumulado
    const movements = await prisma.creditMovement.findMany({ where: { clientId: testUser.id } });
    const totalCredits = movements.reduce((s, m) => s + m.amount, 0);
    assert.strictEqual(totalCredits, 1500, 'El saldo del cliente debe ser exactamente 1500');
    console.log(`   ✓ Créditos otorgados: $${awardResult.amount} MXN. Saldo verificado: $${totalCredits}`);

    // -------------------------------------------------------------
    // 4. Candado anti-doble pago (Idempotencia)
    // -------------------------------------------------------------
    console.log('\n▶ [4/6] Probando candado anti-doble pago (segundo award debe ser rechazado)...');
    let doubleAwardBlocked = false;
    try {
      await referralService.awardCredits({
        prospectId: clientProspect.id,
        referralId: clientRef.id,
      });
    } catch (err) {
      doubleAwardBlocked = true;
      console.log(`   ✓ Rechazado correctamente con mensaje: "${err.message}"`);
    }
    assert.strictEqual(doubleAwardBlocked, true, 'El segundo intento de cobro DEBE ser bloqueado');

    const movementsAfter = await prisma.creditMovement.findMany({ where: { clientId: testUser.id } });
    assert.strictEqual(movementsAfter.length, 1, 'No debe existir ningún segundo movimiento de créditos');
    console.log('   ✓ Candado anti-doble pago verificado exitosamente.');

    // -------------------------------------------------------------
    // 5. Progresión de nivel (Sube a Partner Nivel 2 a las 5 conversiones)
    // -------------------------------------------------------------
    console.log('\n▶ [5/6] Probando progresión de niveles (Member -> Partner al llegar a 5 cerrados)...');
    for (let i = 2; i <= 5; i++) {
      const extraRef = await prisma.referral.create({
        data: {
          referrerId: testUser.id,
          companyName: `Empresa Smoke Extra #${i}`,
          status: 'registered',
        }
      });
      createdReferralIds.push(extraRef.id);

      const res = await referralService.awardCredits({
        referralId: extraRef.id,
      });
      createdMovementIds.push(res.movement.id);
    }

    const updatedUser = await prisma.user.findUnique({ where: { id: testUser.id } });
    assert.strictEqual(updatedUser.level, 2, 'El socio debe subir automáticamente a Nivel 2 (Partner)');
    console.log(`   ✓ Nivel del socio tras 5 conversiones: Nivel ${updatedUser.level} (Partner).`);

    // Siguiente recomendación en Nivel 2 debe pagar $2,500
    const partnerRef = await prisma.referral.create({
      data: {
        referrerId: testUser.id,
        companyName: 'Empresa Smoke Nivel 2',
        status: 'registered',
      }
    });
    createdReferralIds.push(partnerRef.id);

    const partnerAward = await referralService.awardCredits({
      referralId: partnerRef.id,
    });
    createdMovementIds.push(partnerAward.movement.id);

    assert.strictEqual(partnerAward.amount, 2500, 'Nivel 2 Partner debe otorgar $2,500 MXN');
    console.log(`   ✓ En Nivel 2 se otorgaron automáticamente $${partnerAward.amount} MXN (Partner).`);

    // -------------------------------------------------------------
    // 6. Validación de código inválido o autorreferido
    // -------------------------------------------------------------
    console.log('\n▶ [6/6] Verificando rechazo de códigos no existentes...');
    const fakeLookup = await referralService.findReferrerByCode('CODIGO_INEXISTENTE_9999', prisma);
    assert.strictEqual(fakeLookup, null, 'Código inexistente debe retornar null');
    console.log('   ✓ Códigos inexistentes son detectados correctamente.');

    console.log('\n======================================================');
    console.log('🎉 TODOS LOS CHECKS DEL SMOKE TEST PASARON (100% VERDE)');
    console.log('======================================================\n');
  } finally {
    // Teardown / Limpieza de datos de prueba
    console.log('🧹 Limpiando registros de prueba...');
    if (createdMovementIds.length) {
      await prisma.creditMovement.deleteMany({ where: { id: { in: createdMovementIds } } });
    }
    if (createdProspectIds.length) {
      await prisma.prospect.deleteMany({ where: { id: { in: createdProspectIds } } });
    }
    if (createdReferralIds.length) {
      await prisma.referral.deleteMany({ where: { id: { in: createdReferralIds } } });
    }
    if (testUser) {
      await prisma.user.delete({ where: { id: testUser.id } });
    }
    console.log('✨ Base de datos limpia tras la prueba.\n');
  }
}

runSmokeTest()
  .catch((err) => {
    console.error('❌ Falló el Smoke Test:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
