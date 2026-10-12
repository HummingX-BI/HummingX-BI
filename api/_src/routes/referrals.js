const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /referrals/my — Client gets their own referrals
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

    // Ensure user has a referralCode
    let user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { referralCode: true, companyName: true, name: true },
    });

    let referralCode = user?.referralCode;
    if (!referralCode) {
      const baseCode = (user?.companyName || user?.name || 'hx')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .slice(0, 20) || 'socio';

      referralCode = `${baseCode}-${Math.random().toString(36).substring(2, 6)}`;
      await prisma.user.update({
        where: { id: req.user.id },
        data: { referralCode },
      });
    }

    res.json({
      referrals,
      creditMovements,
      totalCredits,
      referralCode,
    });
  } catch (err) {
    console.error('[REFERRALS] Error en GET /referrals/my:', err);
    res.status(500).json({ error: 'Error al cargar referidos.' });
  }
});

// POST /referrals — Client submits a new referral
router.post('/', authenticate, async (req, res) => {
  try {
    const { companyName, contactName, contactEmail, contactPhone, notes } = req.body;

    if (!companyName || !companyName.trim()) {
      return res.status(400).json({ error: 'El nombre de la empresa es requerido.' });
    }

    const referral = await prisma.referral.create({
      data: {
        referrerId: req.user.id,
        companyName: companyName.trim(),
        contactName: contactName?.trim() || null,
        contactEmail: contactEmail?.trim() || null,
        contactPhone: contactPhone?.trim() || null,
        notes: notes?.trim() || null,
        status: 'registered',
      },
    });

    res.status(201).json(referral);
  } catch (err) {
    console.error('[REFERRALS] Error en POST /referrals:', err);
    res.status(500).json({ error: 'Error al registrar recomendación.' });
  }
});

module.exports = router;
