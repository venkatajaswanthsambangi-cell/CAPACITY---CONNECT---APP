import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/progress
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const { userId, courseId } = req.query;
  let progress = db.getProgress();

  if (actor.role === 'learner') {
    progress = progress.filter(p => p.userId === actor.id);
  } else if (userId) {
    progress = progress.filter(p => p.userId === (userId as string));
  }

  if (courseId) {
    progress = progress.filter(p => p.courseId === (courseId as string));
  }

  res.json({ progress });
});

// GET /api/progress/summary (Authenticated)
router.get('/summary', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const targetUserId = (req.query.userId as string) || actor.id;

  if (actor.role === 'learner' && targetUserId !== actor.id) {
    return res.status(403).json({ error: 'Forbidden: You can only view your own progress summary' });
  }

  const userProgress = db.getProgress().filter(p => p.userId === targetUserId);
  const enrolledCount = userProgress.length;
  const completedCount = userProgress.filter(p => p.isCompleted).length;
  const averagePercentage = enrolledCount > 0
    ? Math.round(userProgress.reduce((sum, p) => sum + p.progressPercentage, 0) / enrolledCount)
    : 0;

  res.json({
    summary: {
      userId: targetUserId,
      enrolledCount,
      completedCount,
      inProgressCount: enrolledCount - completedCount,
      averagePercentage,
      certificatesEarned: userProgress.filter(p => p.certificateId).map(p => ({
        courseId: p.courseId,
        certificateId: p.certificateId,
        completedAt: p.completedAt
      }))
    }
  });
});

// GET /api/progress/:courseId
router.get('/:courseId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const { courseId } = req.params;
  const targetUserId = (req.query.userId as string) || actor.id;

  if (actor.role === 'learner' && targetUserId !== actor.id) {
    return res.status(403).json({ error: 'Forbidden: You can only view your own progress' });
  }

  const progress = db.getProgress().find(p => p.userId === targetUserId && p.courseId === courseId);
  res.json({ progress: progress || null });
});

// POST /api/progress/complete-lesson
router.post('/complete-lesson', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const { courseId, lessonId } = req.body;

  if (!courseId || !lessonId) {
    return res.status(400).json({ error: 'courseId and lessonId are required' });
  }

  // Uses toggle logic so learners can mark or unmark lessons dynamically from the UI
  const updated = db.toggleLearnerProgress(actor.id, courseId, lessonId);
  res.json({ progress: updated });
});

// POST /api/progress/toggle-lesson
router.post('/toggle-lesson', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const { courseId, lessonId } = req.body;

  if (!courseId || !lessonId) {
    return res.status(400).json({ error: 'courseId and lessonId are required' });
  }

  const updated = db.toggleLearnerProgress(actor.id, courseId, lessonId);
  res.json({ progress: updated });
});

export default router;
