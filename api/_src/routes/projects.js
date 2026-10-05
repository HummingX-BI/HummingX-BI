const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /projects/my — Client gets their own projects
router.get('/my', authenticate, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { clientId: req.user.id },
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        }
      }
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Error al cargar proyectos.' });
  }
});

// PUT /projects/:id/design-status — Client updates design status
router.put('/:id/design-status', authenticate, async (req, res) => {
  try {
    const { designStatus } = req.body;
    
    if (!['approved', 'modifications_requested'].includes(designStatus)) {
      return res.status(400).json({ error: 'Estado de diseño inválido.' });
    }

    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project || project.clientId !== req.user.id) {
      return res.status(404).json({ error: 'Proyecto no encontrado o acceso denegado.' });
    }

    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: { designStatus }
    });
    
    // Log activity
    await prisma.projectActivity.create({
      data: {
        projectId: req.params.id,
        description: designStatus === 'approved' ? 'El cliente aprobó el diseño UX/UI.' : 'El cliente solicitó modificaciones al diseño.',
        type: 'update'
      }
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el estado de diseño.' });
  }
});

// GET /projects/:id — Get single project detail
router.get('/:id', authenticate, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        activities: { orderBy: { createdAt: 'desc' } },
        client: {
          select: { id: true, name: true, companyName: true, email: true }
        }
      }
    });

    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado.' });

    // Client can only see their own projects
    if (req.user.role === 'client' && project.clientId !== req.user.id) {
      return res.status(403).json({ error: 'Acceso denegado.' });
    }

    // Hide internal notes from clients
    if (req.user.role === 'client') {
      project.internalNotes = undefined;
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Error al cargar el proyecto.' });
  }
});

// PUT /projects/:id — Admin updates project phase/progress
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, currentPhase, progressPercent, estimatedDelivery, status, internalNotes, quoteLink, contractLink } = req.body;

    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado.' });

    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(currentPhase !== undefined && { currentPhase }),
        ...(progressPercent !== undefined && { progressPercent }),
        ...(estimatedDelivery !== undefined && { estimatedDelivery: new Date(estimatedDelivery) }),
        ...(status !== undefined && { status }),
        ...(internalNotes !== undefined && { internalNotes }),
        ...(quoteLink !== undefined && { quoteLink }),
        ...(contractLink !== undefined && { contractLink }),
      },
      include: { activities: { orderBy: { createdAt: 'desc' }, take: 10 } }
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el proyecto.' });
  }
});

// POST /projects/:id/activity — Admin adds activity log entry
router.post('/:id/activity', authenticate, requireAdmin, async (req, res) => {
  try {
    const { description, type } = req.body;

    if (!description) return res.status(400).json({ error: 'La descripción es requerida.' });

    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado.' });

    const activity = await prisma.projectActivity.create({
      data: {
        projectId: req.params.id,
        authorId: req.user.id,
        description,
        type: type || 'update',
      }
    });

    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar actividad.' });
  }
});

module.exports = router;
