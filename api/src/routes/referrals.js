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

    res.json({ referrals, creditMovements, totalCredits });
  } catch (err) {
    res.status(500).json({ error: 'Error al cargar referidos.' });
  }
});

// POST /referrals — Client submits a new referral
router.post('/', authenticate, async (req, res) => {
  try {
    const { companyName, contactName, contactEmail, contactPhone } = req.body;

    if (!companyName) {
      return res.status(400).json({ error: 'El nombre de la empresa es requerido.' });
    }

    const referral = await prisma.referral.create({
      data: {
        referrerId: req.user.id,
        companyName,
        contactName,
        contactEmail,
        contactPhone,
        status: 'registered',
      }
    });

    res.status(201).json(referral);
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar recomendación.' });
  }
});

module.exports = router;
