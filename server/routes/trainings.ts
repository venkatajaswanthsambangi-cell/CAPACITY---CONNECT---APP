import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireRole, requireAuth } from '../middleware/auth';
import { TrainingCohort } from '../../src/types';

const router = Router();

// GET /api/trainings
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const trainings = db.getTrainings();
  res.json({ trainings });
});

// POST /api/trainings (Trainer, Admin, Super Admin)
router.post('/', requireRole(['super_admin', 'admin', 'trainer']), (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const body = req.body;

  if (!body.title || !body.courseId) {
    return res.status(400).json({ error: 'Title and CourseId are required' });
  }

  const course = db.getCourses().find(c => c.id === body.courseId);

  const newTraining: TrainingCohort = {
    id: `tr_${Date.now()}`,
    title: body.title,
    courseId: body.courseId,
    courseTitle: course ? course.title : (body.courseTitle || 'Training Course'),
    trainerId: body.trainerId || actor.id,
    trainerName: body.trainerName || actor.name,
    startDate: body.startDate || new Date().toISOString().split('T')[0],
    endDate: body.endDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    meetingSchedule: body.meetingSchedule || 'Flexible schedule',
    location: body.location || 'Virtual Interactive Room',
    capacity: Number(body.capacity) || 30,
    enrolledLearnerIds: [],
    status: 'Active',
    createdAt: new Date().toISOString()
  };

  const created = db.createTraining(newTraining, actor);
  res.status(201).json({ training: created });
});

// POST /api/trainings/:id/enroll (Learner enrolls themselves, or Admin/Trainer enrolls them)
router.post('/:id/enroll', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const id = String(req.params.id);
  const learnerId = req.body.learnerId || actor.id;

  try {
    const updated = db.enrollInTraining(id, learnerId, actor);
    res.json({ training: updated, message: 'Enrolled successfully' });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

export default router;
