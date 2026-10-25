const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');
const referralService = require('../services/referralService');

const router = express.Router();

// GET /referrals/my — Client gets their own referrals, credit movements, code and level
router.get('/my', authenticate, async (req, res) => {
  try {
    const referrals = await prisma.referral.findMany({
      where: { referrerId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    const creditMovements = await prisma.creditMovement.findMany({
      where: { clientId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    const totalCredits = creditMovements.reduce((sum, m) => sum + m.amount, 0);

    // Ensure user has a valid 5-digit numeric referralCode
    let user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { referralCode: true, legacyReferralCode: true, companyName: true, name: true, level: true },
    });

    let referralCode = user?.referralCode;
    if (!referralCode || !/^\d{5,6}$/.test(referralCode)) {
      referralCode = await referralService.generateNumericReferralCode();
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          referralCode,
          ...(user?.referralCode && { legacyReferralCode: user.referralCode }),
        },
      });
    }

    // Dynamic level recalculation using referralService
    const { level: dynamicLevel, convertedCount } = await referralService.recalcLevel(req.user.id);
    const tierInfo = referralService.getTier(dynamicLevel);

    res.json({
      referrals,
      creditMovements,
      totalCredits,
      referralCode,
      legacyReferralCode: user?.legacyReferralCode || null,
      level: dynamicLevel,
      tier: tierInfo,
      convertedCount,
      allTiers: referralService.TIERS,
    });
  } catch (err) {
    console.error('[REFERRALS] Error en GET /referrals/my:', err);
    res.status(500).json({ error: 'Error al cargar referidos.' });
  }
});

// POST /referrals — Client submits a new referral (synchronized with CRM Prospects)
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.impersonatedBy || req.user.isImpersonating) {
      return res.status(403).json({
        error: 'Acción bloqueada: Estás en modo de visualización de administrador (solo lectura).'
      });
    }

    if (req.user.role !== 'client') {
      return res.status(403).json({ error: 'Solo los clientes pueden registrar recomendaciones.' });
    }

    const { companyName, contactName, contactEmail, contactPhone, notes } = req.body;

    if (!companyName || !companyName.trim()) {
      return res.status(400).json({ error: 'El nombre de la empresa es requerido.' });
    }

    const result = await referralService.createClientReferral({
      referrerId: req.user.id,
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      notes,
    });

    res.status(201).json(result.referral);
  } catch (err) {
    console.error('[REFERRALS] Error en POST /referrals:', err);
    res.status(500).json({ error: 'Error al registrar recomendación.' });
  }
});

// PUT /referrals/code — Personal code is permanent and system-assigned (numeric 5 digits)
router.put('/code', authenticate, async (req, res) => {
  if (req.user.impersonatedBy || req.user.isImpersonating) {
    return res.status(403).json({
      error: 'Acción bloqueada: Estás en modo de visualización de administrador (solo lectura).'
    });
  }

  // Codes are system-assigned 5-digit numbers; not editable manually to prevent collisions and broken links
  return res.status(400).json({
    error: 'El código de socio es personal, numérico de 5 dígitos y asignado de manera fija por el sistema.'
  });
});

module.exports = router;
