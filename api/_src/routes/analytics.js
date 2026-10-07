const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.post('/heartbeat', authenticate, async (req, res) => {
  try {
    if (req.headers['x-impersonating'] === 'true') return res.json({ ok: true });
    
    await prisma.user.update({
      where: { id: req.user.id },
      data: { totalTimeSpent: { increment: 60 } }
    });
    
    res.json({ ok: true });
  } catch (err) {
    console.error('[ANALYTICS] heartbeat err:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/pageview', authenticate, async (req, res) => {
  try {
    if (req.headers['x-impersonating'] === 'true') return res.json({ ok: true });
    
    const { path } = req.body;
    if (!path) return res.status(400).json({ error: 'Path required' });

    await prisma.pageView.create({
      data: {
        userId: req.user.id,
        path: path.substring(0, 255)
      }
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('[ANALYTICS] pageview err:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
