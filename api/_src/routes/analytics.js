const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.post('/heartbeat', authenticate, async (req, res) => {
  try {
    if (req.headers['x-impersonating'] === 'true') return res.json({ ok: true });
    if (req.user.role === 'admin') return res.json({ ok: true });

    const { sessionId, path } = req.body;
    if (!sessionId || typeof sessionId !== 'string' || sessionId.length < 8 || sessionId.length > 64) {
      return res.status(400).json({ error: 'Valid sessionId required (8-64 chars)' });
    }

    const rawSec = parseInt(req.body.activeSec, 10);
    const activeSec = Math.max(1, Math.min(30, isNaN(rawSec) ? 15 : rawSec));

    const ua = req.headers['user-agent'] || '';
    const deviceType = /Mobi|Android|iPhone/i.test(ua) ? 'mobile' : 'desktop';
    const entryPath = path && typeof path === 'string' ? path.substring(0, 255) : null;

    try {
      await prisma.$transaction([
        prisma.portalSession.upsert({
          where: { id: sessionId },
          create: {
            id: sessionId,
            userId: req.user.id,
            startedAt: new Date(),
            lastSeenAt: new Date(),
            activeSec,
            deviceType,
            entryPath,
          },
          update: {
            activeSec: { increment: activeSec },
            lastSeenAt: new Date(),
          }
        }),
        prisma.user.update({
          where: { id: req.user.id },
          data: {
            totalTimeSpent: { increment: activeSec }
          }
        })
      ]);
    } catch (dbErr) {
      if (dbErr.code === 'P2021' || dbErr.code === 'P2022') {
        await prisma.user.update({
          where: { id: req.user.id },
          data: { totalTimeSpent: { increment: activeSec } }
        }).catch(() => {});
      } else {
        console.error('[ANALYTICS] heartbeat dbErr:', dbErr.message);
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('[ANALYTICS] heartbeat err:', err.message);
    res.json({ ok: true });
  }
});

router.post('/pageview', authenticate, async (req, res) => {
  try {
    if (req.headers['x-impersonating'] === 'true') return res.json({ ok: true });
    if (req.user.role === 'admin') return res.json({ ok: true });

    const { path, sessionId } = req.body;
    if (!path || typeof path !== 'string') return res.status(400).json({ error: 'Path required' });

    const sid = (sessionId && typeof sessionId === 'string' && sessionId.length <= 64) ? sessionId : null;

    try {
      await prisma.pageView.create({
        data: {
          userId: req.user.id,
          path: path.substring(0, 255),
          sessionId: sid
        }
      });
    } catch (pvErr) {
      if (pvErr.code === 'P2022') {
        await prisma.pageView.create({
          data: {
            userId: req.user.id,
            path: path.substring(0, 255)
          }
        }).catch(() => {});
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('[ANALYTICS] pageview err:', err.message);
    res.json({ ok: true });
  }
});

module.exports = router;
