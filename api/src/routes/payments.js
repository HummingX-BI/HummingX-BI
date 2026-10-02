const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET /payments (Admin only - all payments)
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        project: {
          include: {
            client: {
              select: { name: true, companyName: true, logoUrl: true }
            }
          }
        }
      },
      orderBy: { dueDate: 'asc' },
    });
    res.json(payments);
  } catch (error) {
    next(error);
  }
});

// GET /payments/my-payments (Client only - their own payments)
router.get('/my-payments', authenticate, async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        project: {
          clientId: req.user.id,
        },
      },
      include: {
        project: {
          select: { name: true, id: true }
        }
      },
      orderBy: { dueDate: 'asc' },
    });
    res.json(payments);
  } catch (error) {
    next(error);
  }
});

// Helper to safely parse date string without timezone day-shifting
const parseSafeDate = (d) => {
  if (!d) return new Date();
  if (typeof d === 'string') {
    const dateOnly = d.split('T')[0];
    if (dateOnly.includes('-')) {
      return new Date(`${dateOnly}T12:00:00.000Z`);
    }
  }
  return new Date(d);
};

// POST /payments/plan (Admin only - Batch register payment plan)
router.post('/plan', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { projectId, payments, replaceExisting } = req.body;
    
    if (!projectId || !Array.isArray(payments) || payments.length === 0) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (projectId y lista de pagos).' });
    }

    if (replaceExisting) {
      await prisma.payment.deleteMany({
        where: { projectId }
      });
    }

    const createdPayments = [];
    for (const p of payments) {
      if (!p.title || p.amount === undefined || !p.dueDate) continue;
      const created = await prisma.payment.create({
        data: {
          projectId,
          title: p.title,
          description: p.description || null,
          amount: parseFloat(p.amount),
          status: p.status || 'pending',
          dueDate: parseSafeDate(p.dueDate),
          invoiceLink: p.invoiceLink || null,
          receiptLink: p.receiptLink || null,
        }
      });
      createdPayments.push(created);
    }

    res.status(201).json({
      success: true,
      count: createdPayments.length,
      payments: createdPayments
    });
  } catch (error) {
    next(error);
  }
});

// POST /payments (Admin only - Single payment)
router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { projectId, title, description, amount, status, dueDate, invoiceLink, receiptLink } = req.body;
    
    if (!projectId || !title || !amount || !dueDate) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (projectId, title, amount, dueDate).' });
    }

    const payment = await prisma.payment.create({
      data: {
        projectId,
        title,
        description,
        amount: parseFloat(amount),
        status: status || 'pending',
        dueDate: parseSafeDate(dueDate),
        invoiceLink,
        receiptLink,
      },
    });
    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
});

// PUT /payments/:id (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, amount, status, dueDate, invoiceLink, receiptLink } = req.body;

    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (amount !== undefined) data.amount = parseFloat(amount);
    if (status !== undefined) data.status = status;
    if (dueDate !== undefined) data.dueDate = parseSafeDate(dueDate);
    if (invoiceLink !== undefined) data.invoiceLink = invoiceLink;
    if (receiptLink !== undefined) data.receiptLink = receiptLink;

    const payment = await prisma.payment.update({
      where: { id },
      data,
    });
    res.json(payment);
  } catch (error) {
    next(error);
  }
});

// DELETE /payments/:id (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.payment.delete({
      where: { id },
    });
    res.json({ success: true, message: 'Pago eliminado.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
