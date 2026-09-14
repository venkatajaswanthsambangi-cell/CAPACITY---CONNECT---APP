import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireRole, requireAuth } from '../middleware/auth';
import { Competency } from '../../src/types';

const router = Router();

// GET /api/competencies
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const competencies = db.getCompetencies();
  res.json({ competencies });
});

// POST /api/competencies (Admin, Super Admin)
router.post('/', requireRole(['super_admin', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const body = req.body;

  if (!body.name || !body.code) {
    return res.status(400).json({ error: 'Name and Code are required' });
  }

  const newComp: Competency = {
    id: `comp_${Date.now()}`,
    code: body.code,
    name: body.name,
    category: body.category || 'Core Skill',
    description: body.description || '',
    levels: body.levels || [],
    relatedCourseIds: body.relatedCourseIds || [],
    createdAt: new Date().toISOString()
  };

  const created = db.createCompetency(newComp, actor);
  res.status(201).json({ competency: created });
});

// GET /api/competencies/learner
router.get('/learner', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  let targetUserId = req.query.userId as string | undefined;

  // Learner can only view their own competency status
  if (actor.role === 'learner') {
    targetUserId = actor.id;
  } else if (!targetUserId) {
    targetUserId = actor.id;
  }

  const statuses = db.getLearnerCompetencies().filter(lc => lc.userId === targetUserId);
  res.json({ statuses });
});

// GET /api/competencies/:id
router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const competency = db.getCompetencies().find(c => c.id === req.params.id);
  if (!competency) {
    return res.status(404).json({ error: 'Competency not found' });
  }
  res.json({ competency });
});

// PUT /api/competencies/:id (Admin, Super Admin)
router.put('/:id', requireRole(['super_admin', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const id = String(req.params.id);

  try {
    const updated = db.updateCompetency(id, req.body, actor);
    res.json({ competency: updated, message: 'Competency updated successfully' });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// DELETE /api/competencies/:id (Admin, Super Admin)
router.delete('/:id', requireRole(['super_admin', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const id = String(req.params.id);

  try {
    const removed = db.deleteCompetency(id, actor);
    res.json({ competency: removed, message: 'Competency deleted successfully' });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// POST /api/competencies/verify (Trainer, Admin, Super Admin)
router.post('/verify', requireRole(['super_admin', 'admin', 'trainer']), (req: AuthenticatedRequest, res: Response) => {
  const validator = req.user!;
  const { userId, competencyId, level } = req.body;

  if (!userId || !competencyId || level === undefined) {
    return res.status(400).json({ error: 'userId, competencyId, and level are required' });
  }

  const numericLevel = Number(level);
  if (isNaN(numericLevel) || numericLevel < 1 || numericLevel > 5) {
    return res.status(400).json({ error: 'Level must be an integer between 1 and 5' });
  }

  const updated = db.updateLearnerCompetency(userId, competencyId, numericLevel, validator);
  res.json({ status: updated, message: 'Competency verified successfully' });
});

export default router;
