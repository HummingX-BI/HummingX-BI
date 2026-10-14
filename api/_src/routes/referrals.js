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

    // Ensure user has a referralCode and fetch level
    let user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { referralCode: true, companyName: true, name: true, level: true },
    });

    let referralCode = user?.referralCode;
    if (!referralCode) {
      // Generar código numérico único de 5 dígitos (ej. 84920)
      let candidateCode;
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        attempts++;
        candidateCode = String(Math.floor(10000 + Math.random() * 90000));
        const existing = await prisma.user.findUnique({ where: { referralCode: candidateCode } });
        if (!existing) isUnique = true;
      }
      referralCode = candidateCode || `HX-${Math.floor(1000 + Math.random() * 9000)}`;
      await prisma.user.update({
        where: { id: req.user.id },
        data: { referralCode },
      });
    }

    // Dynamic level based on converted referrals count
    const convertedCount = referrals.filter(r => r.status === 'converted').length;
    const dynamicLevel = convertedCount >= 10 ? 3 : convertedCount >= 5 ? 2 : 1;
    if (user && user.level !== dynamicLevel) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { level: dynamicLevel },
      });
    }

    res.json({
      referrals,
      creditMovements,
      totalCredits,
      referralCode,
      level: dynamicLevel,
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

    // Also register in CRM Prospects so it appears directly in the admin CRM
    try {
      const referrer = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { companyName: true, name: true },
      });
      const referrerName = referrer?.companyName || referrer?.name || 'Cliente';

      await prisma.prospect.create({
        data: {
          companyName: companyName.trim(),
          contactName: contactName?.trim() || null,
          email: contactEmail?.trim() || null,
          phone: contactPhone?.trim() || null,
          source: `Referido por ${referrerName}`,
          notes: notes?.trim() 
            ? `[Recomendado por socio: ${referrerName}] ${notes.trim()}` 
            : `Recomendado por socio: ${referrerName}`,
          status: 'lead',
        },
      });
    } catch (crmErr) {
      console.warn('[REFERRALS] No se pudo crear prospecto en CRM automáticamente:', crmErr.message);
    }

    res.status(201).json(referral);
  } catch (err) {
    console.error('[REFERRALS] Error en POST /referrals:', err);
    res.status(500).json({ error: 'Error al registrar recomendación.' });
  }
});

// PUT /referrals/code — Client updates their referral code (numeric or custom)
router.put('/code', authenticate, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code || !/^[A-Za-z0-9_-]{3,20}$/.test(String(code).trim())) {
      return res.status(400).json({ error: 'El código debe tener entre 3 y 20 caracteres alfanuméricos o números (ej. 84920).' });
    }

    const cleanCode = String(code).trim();
    // Check if code is taken by another user
    const existing = await prisma.user.findFirst({
      where: {
        referralCode: { equals: cleanCode, mode: 'insensitive' },
        NOT: { id: req.user.id }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Este código ya está en uso por otro socio. Por favor elige otro número o código.' });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { referralCode: cleanCode },
      select: { referralCode: true }
    });

    res.json({ referralCode: updated.referralCode });
  } catch (err) {
    console.error('[REFERRALS] Error en PUT /referrals/code:', err);
    res.status(500).json({ error: 'Error al actualizar código de socio.' });
  }
});

module.exports = router;
