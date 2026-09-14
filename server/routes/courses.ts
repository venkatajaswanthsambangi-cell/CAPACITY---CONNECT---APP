import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireRole } from '../middleware/auth';
import { Course } from '../../src/types';

const router = Router();

// GET /api/courses
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const { category, level, search } = req.query;
  let courses = db.getCourses();

  if (category && category !== 'All') {
    courses = courses.filter(c => c.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (level && level !== 'All') {
    courses = courses.filter(c => c.level.toLowerCase() === (level as string).toLowerCase());
  }

  if (search) {
    const q = (search as string).toLowerCase();
    courses = courses.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }

  res.json({ courses });
});

// GET /api/courses/:id
router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const course = db.getCourses().find(c => c.id === req.params.id);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  res.json({ course });
});

// POST /api/courses (Trainer, Admin, Super Admin)
router.post('/', requireRole(['super_admin', 'admin', 'trainer']), (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const body = req.body;

  if (!body.title || !body.code) {
    return res.status(400).json({ error: 'Title and Course Code are required' });
  }

  const newCourse: Course = {
    id: `crs_${Date.now()}`,
    title: body.title,
    code: body.code,
    description: body.description || '',
    category: body.category || 'General',
    level: body.level || 'Beginner',
    durationHours: Number(body.durationHours) || 20,
    instructorId: actor.id,
    instructorName: actor.name,
    thumbnailUrl: body.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
    modules: body.modules || [],
    competencyIds: body.competencyIds || [],
    isPublished: body.isPublished !== undefined ? body.isPublished : true,
    enrolledCount: 0,
    rating: 5.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const created = db.createCourse(newCourse, actor);
  res.status(201).json({ course: created });
});

// PUT /api/courses/:id (Trainer, Admin, Super Admin)
router.put('/:id', requireRole(['super_admin', 'admin', 'trainer']), (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const id = String(req.params.id);
  try {
    const updated = db.updateCourse(id, req.body, actor);
    res.json({ course: updated });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// DELETE /api/courses/:id (Admin, Super Admin)
router.delete('/:id', requireRole(['super_admin', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const id = String(req.params.id);
  try {
    const deleted = db.deleteCourse(id, actor);
    res.json({ deleted, message: 'Course deleted successfully' });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

export default router;
