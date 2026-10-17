const prisma = require('../lib/prisma');

const TIERS = {
  1: { level: 1, name: 'Member', badge: 'Member (Nivel 1)', amount: 1500, minConverted: 0, nextMin: 5 },
  2: { level: 2, name: 'Partner', badge: 'Partner (Nivel 2)', amount: 2500, minConverted: 5, nextMin: 10 },
  3: { level: 3, name: 'VIP', badge: 'VIP (Nivel 3)', amount: 3500, minConverted: 10, nextMin: null },
};

/**
 * Retorna la información de nivel y beneficios según el número de conversiones
 */
function calculateLevel(convertedCount) {
  if (convertedCount >= 10) return 3;
  if (convertedCount >= 5) return 2;
  return 1;
}

/**
 * Obtiene los detalles de un nivel específico
 */
function getTier(level = 1) {
  return TIERS[level] || TIERS[1];
}

/**
 * Genera un código de socio numérico único de 5 dígitos (o 6 si se llena el espacio)
 */
async function generateNumericReferralCode(db = prisma) {
  let attempts = 0;
  while (attempts < 20) {
    attempts++;
    const code = String(Math.floor(10000 + Math.random() * 90000));
    const exists = await db.user.findFirst({
      where: {
        OR: [
          { referralCode: code },
          { legacyReferralCode: code }
        ]
      }
    });
    if (!exists) return code;
  }

  // Fallback a 6 dígitos en caso de colisión persistente
  while (true) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const exists = await db.user.findFirst({
      where: {
        OR: [
          { referralCode: code },
          { legacyReferralCode: code }
        ]
      }
    });
    if (!exists) return code;
  }
}

/**
 * Busca a un socio recomendador por código (admite numérico nuevo, prefijo HX- o slugs heredados)
 */
async function findReferrerByCode(rawCode, db = prisma) {
  if (!rawCode || typeof rawCode !== 'string') return null;
  const trimmed = rawCode.trim();
  if (!trimmed) return null;

  const clean = trimmed.replace(/^hx-/i, '');

  return await db.user.findFirst({
    where: {
      OR: [
        { referralCode: { equals: clean, mode: 'insensitive' } },
        { referralCode: { equals: `HX-${clean}`, mode: 'insensitive' } },
        { referralCode: { equals: trimmed, mode: 'insensitive' } },
        { legacyReferralCode: { equals: clean, mode: 'insensitive' } },
        { legacyReferralCode: { equals: trimmed, mode: 'insensitive' } },
      ]
    }
  });
}

/**
 * Recalcula el nivel del socio según la cantidad de recomendaciones convertidas
 */
async function recalcLevel(userId, db = prisma) {
  const convertedCount = await db.referral.count({
    where: { referrerId: userId, status: 'converted' },
  });

  const newLevel = calculateLevel(convertedCount);
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { level: true },
  });

  if (user && user.level !== newLevel) {
    await db.user.update({
      where: { id: userId },
      data: { level: newLevel },
    });
  }

  return { level: newLevel, convertedCount };
}

/**
 * Otorga créditos por recomendación de forma IDEMPOTENTE y dentro de una TRANSACCIÓN
 */
async function awardCredits({ prospectId, referralId, customAmount, adminId, reason }) {
  return await prisma.$transaction(async (tx) => {
    let referral = null;
    let prospect = null;

    if (referralId) {
      referral = await tx.referral.findUnique({ where: { id: referralId } });
    }

    if (prospectId) {
      prospect = await tx.prospect.findUnique({ where: { id: prospectId } });
      if (prospect && !referral) {
        if (prospect.referralId) {
          referral = await tx.referral.findUnique({ where: { id: prospect.referralId } });
        } else if (prospect.referralCode) {
          const referrer = await findReferrerByCode(prospect.referralCode, tx);
          if (referrer) {
            referral = await tx.referral.findFirst({
              where: {
                referrerId: referrer.id,
                companyName: { equals: prospect.companyName, mode: 'insensitive' }
              }
            });
            if (!referral) {
              referral = await tx.referral.create({
                data: {
                  referrerId: referrer.id,
                  companyName: prospect.companyName,
                  contactName: prospect.contactName,
                  contactEmail: prospect.email,
                  contactPhone: prospect.phone,
                  notes: `Convertido desde prospecto CRM (${prospect.id})`,
                  status: 'registered',
                  origin: 'admin_code',
                }
              });
            }
          }
        }
      }
    }

    if (!referral) {
      throw new Error('No se encontró el registro de recomendación para otorgar créditos.');
    }

    // Candado 1: verificar si ya tiene créditos generados
    if (referral.creditsGenerated > 0) {
      throw new Error(`Ya se habían otorgado $${referral.creditsGenerated} créditos por esta recomendación.`);
    }

    // Candado 2: verificar si ya existe un CreditMovement único vinculado a este referralId
    const existingMovement = await tx.creditMovement.findUnique({
      where: { referralId: referral.id },
    });
    if (existingMovement) {
      throw new Error(`Ya existe un movimiento de créditos (ID: ${existingMovement.id}) para esta recomendación.`);
    }

    const referrer = await tx.user.findUnique({ where: { id: referral.referrerId } });
    if (!referrer) {
      throw new Error('El socio recomendador no existe en el sistema.');
    }

    // Determinar monto según el nivel del socio o monto personalizado
    const referrerLevel = referrer.level || 1;
    const tier = getTier(referrerLevel);
    const amount = customAmount ? parseInt(customAmount, 10) : tier.amount;

    if (!amount || amount <= 0) {
      throw new Error('El monto de créditos a otorgar debe ser mayor a 0.');
    }

    // Actualizar el estado del referral a converted con los créditos generados
    const updatedReferral = await tx.referral.update({
      where: { id: referral.id },
      data: {
        status: 'converted',
        creditsGenerated: amount,
      },
    });

    // Vincular prospecto si existe
    if (prospect && prospect.referralId !== referral.id) {
      await tx.prospect.update({
        where: { id: prospect.id },
        data: { referralId: referral.id },
      });
    }

    // Crear el movimiento de crédito vinculado de forma única a referralId
    const movement = await tx.creditMovement.create({
      data: {
        clientId: referrer.id,
        referralId: referral.id,
        amount,
        type: 'referral_converted',
        description: reason || `Bono por recomendación exitosa: ${referral.companyName} (${tier.name})`,
      },
    });

    // Recalcular nivel de socio
    const { level: newLevel, convertedCount } = await recalcLevel(referrer.id, tx);

    return {
      success: true,
      referral: updatedReferral,
      movement,
      amount,
      newLevel,
      convertedCount,
      referrer: {
        id: referrer.id,
        name: referrer.name,
        companyName: referrer.companyName,
        email: referrer.email,
        level: newLevel,
      },
    };
  });
}

/**
 * Registra una recomendación desde el portal del cliente vinculando de inmediato el Prospecto CRM
 */
async function createClientReferral({ referrerId, companyName, contactName, contactEmail, contactPhone, notes }) {
  // Asegurar que el recomendador tenga código numérico
  let referrer = await prisma.user.findUnique({
    where: { id: referrerId },
    select: { id: true, name: true, companyName: true, referralCode: true, level: true },
  });

  if (!referrer.referralCode || !/^\d{5,6}$/.test(referrer.referralCode)) {
    const newCode = await generateNumericReferralCode();
    referrer = await prisma.user.update({
      where: { id: referrerId },
      data: { referralCode: newCode },
    });
  }

  const referrerDisplayName = referrer.companyName || referrer.name || 'Cliente';

  return await prisma.$transaction(async (tx) => {
    // 1. Crear Referral
    const referral = await tx.referral.create({
      data: {
        referrerId,
        companyName: companyName.trim(),
        contactName: contactName?.trim() || null,
        contactEmail: contactEmail?.trim() || null,
        contactPhone: contactPhone?.trim() || null,
        notes: notes?.trim() || null,
        status: 'registered',
        origin: 'client_portal',
      },
    });

    // 2. Crear Prospect en CRM con referralId y referralCode explícitos
    const prospect = await tx.prospect.create({
      data: {
        companyName: companyName.trim(),
        contactName: contactName?.trim() || null,
        email: contactEmail?.trim() || null,
        phone: contactPhone?.trim() || null,
        source: `Referido por ${referrerDisplayName} (Cód. ${referrer.referralCode})`,
        referralCode: referrer.referralCode,
        referralId: referral.id,
        notes: notes?.trim()
          ? `[Recomendado por socio: ${referrerDisplayName} - Código: ${referrer.referralCode}] ${notes.trim()}`
          : `Recomendado por socio: ${referrerDisplayName} (Código: ${referrer.referralCode})`,
        status: 'lead',
      },
    });

    return { referral, prospect };
  });
}

/**
 * Sincroniza el estado del Referral a partir del estado de su Prospect vinculado en CRM.
 * Mapeo:
 *   lead -> registered
 *   contacted -> contacted
 *   meeting | proposal_sent | negotiating -> negotiating
 *   lost -> inactive
 *   won -> negotiating (permanece negotiating hasta que el admin abone créditos)
 * Candado: NUNCA toca un referral 'converted' ni degrada creditsGenerated.
 */
async function syncReferralStatusFromProspect(prospect, db = prisma) {
  if (!prospect) return null;
  let referralId = prospect.referralId;

  if (!referralId && prospect.referralCode) {
    const referrer = await findReferrerByCode(prospect.referralCode, db);
    if (referrer) {
      const existingRef = await db.referral.findFirst({
        where: {
          referrerId: referrer.id,
          companyName: { equals: prospect.companyName, mode: 'insensitive' }
        }
      });
      if (existingRef) referralId = existingRef.id;
    }
  }

  if (!referralId) return null;

  const referral = await db.referral.findUnique({ where: { id: referralId } });
  if (!referral) return null;

  // Candado estricto: nunca tocar si ya está convertido o generó créditos
  if (referral.status === 'converted' || (referral.creditsGenerated && referral.creditsGenerated > 0)) {
    return referral;
  }

  let targetStatus = referral.status;
  switch (prospect.status) {
    case 'lead':
      targetStatus = 'registered';
      break;
    case 'contacted':
      targetStatus = 'contacted';
      break;
    case 'meeting':
    case 'proposal_sent':
    case 'negotiating':
      targetStatus = 'negotiating';
      break;
    case 'lost':
      targetStatus = 'inactive';
      break;
    case 'won':
      // won permanece en negotiating hasta que se abone la recompensa
      targetStatus = 'negotiating';
      break;
    default:
      break;
  }

  if (targetStatus !== referral.status) {
    return await db.referral.update({
      where: { id: referral.id },
      data: { status: targetStatus }
    });
  }

  return referral;
}

/**
 * Devuelve el resumen de nivel, tier y progreso para un socio cliente
 */
async function getReferralSummary(userId, db = prisma) {
  const convertedCount = await db.referral.count({
    where: { referrerId: userId, status: 'converted' }
  });
  const level = calculateLevel(convertedCount);
  const tier = getTier(level);

  return {
    level,
    tierName: tier.name,
    badge: tier.badge,
    rewardAmount: tier.amount,
    convertedCount,
    nextLevelAt: tier.nextMin,
    remainingToNext: tier.nextMin !== null ? Math.max(0, tier.nextMin - convertedCount) : 0,
  };
}

module.exports = {
  TIERS,
  calculateLevel,
  getTier,
  generateNumericReferralCode,
  findReferrerByCode,
  recalcLevel,
  awardCredits,
  createClientReferral,
  syncReferralStatusFromProspect,
  getReferralSummary,
};
