import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireRole, requireAuth } from '../middleware/auth';
import { Assessment, AssessmentSubmission } from '../../src/types';

const router = Router();

// GET /api/assessments
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const { courseId, type } = req.query;
  let assessments = db.getAssessments();

  // Role-based filtering: Learners only see assessments for published courses or courses they are enrolled in
  if (actor.role === 'learner') {
    const publishedCourseIds = new Set(db.getCourses().filter(c => c.isPublished).map(c => c.id));
    const enrolledCourseIds = new Set(db.getProgress().filter(p => p.userId === actor.id).map(p => p.courseId));
    
    assessments = assessments.filter(a => publishedCourseIds.has(a.courseId) || enrolledCourseIds.has(a.courseId));

    // Sanitize correctOptionIndex to prevent cheating
    assessments = assessments.map(a => ({
      ...a,
      questions: a.questions.map(q => {
        const { correctOptionIndex, ...safeQuestion } = q;
        return safeQuestion as typeof q;
      })
    }));
  }

  if (courseId) {
    assessments = assessments.filter(a => a.courseId === courseId);
  }

  if (type && type !== 'All') {
    assessments = assessments.filter(a => a.type === type);
  }

  res.json({ assessments });
});

// GET /api/assessments/submissions/my (Learner's own submissions across all assessments)
router.get('/submissions/my', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const submissions = db.getSubmissions().filter(s => s.userId === actor.id);
  res.json({ submissions });
});

// GET /api/assessments/submissions/all (Trainer, Admin, Super Admin)
router.get('/submissions/all', requireRole(['super_admin', 'admin', 'trainer']), (req: AuthenticatedRequest, res: Response) => {
  const submissions = db.getSubmissions();
  res.json({ submissions });
});

// GET /api/assessments/submissions/:id (Authenticated - Learner can only view their own)
router.get('/submissions/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const submission = db.getSubmissions().find(s => s.id === req.params.id);

  if (!submission) {
    return res.status(404).json({ error: 'Submission not found' });
  }

  if (actor.role === 'learner' && submission.userId !== actor.id) {
    return res.status(403).json({ error: 'Forbidden: You can only view your own submissions' });
  }

  res.json({ submission });
});

// GET /api/assessments/:id (Learners permitted only for their courses; sanitize answer key)
router.get('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const assessment = db.getAssessments().find(a => a.id === req.params.id);

  if (!assessment) {
    return res.status(404).json({ error: 'Assessment not found' });
  }

  if (actor.role === 'learner') {
    const publishedCourseIds = new Set(db.getCourses().filter(c => c.isPublished).map(c => c.id));
    const enrolledCourseIds = new Set(db.getProgress().filter(p => p.userId === actor.id).map(p => p.courseId));
    
    if (!publishedCourseIds.has(assessment.courseId) && !enrolledCourseIds.has(assessment.courseId)) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to access this assessment' });
    }

    const sanitizedQuestions = assessment.questions.map(q => {
      const { correctOptionIndex, ...safeQuestion } = q;
      return safeQuestion as typeof q;
    });

    return res.json({
      assessment: {
        ...assessment,
        questions: sanitizedQuestions
      }
    });
  }

  res.json({ assessment });
});

// PUT /api/assessments/:id (Trainer, Admin, Super Admin)
router.put('/:id', requireRole(['super_admin', 'admin', 'trainer']), (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const id = String(req.params.id);
  const body = req.body;

  if (body.title !== undefined && (typeof body.title !== 'string' || body.title.trim().length < 3)) {
    return res.status(400).json({ error: 'Title must be at least 3 characters' });
  }

  if (body.durationMinutes !== undefined) {
    const duration = Number(body.durationMinutes);
    if (isNaN(duration) || duration <= 0) {
      return res.status(400).json({ error: 'Duration must be a positive number' });
    }
  }

  if (body.passPercentage !== undefined) {
    const pass = Number(body.passPercentage);
    if (isNaN(pass) || pass < 1 || pass > 100) {
      return res.status(400).json({ error: 'Pass percentage must be between 1 and 100' });
    }
  }

  try {
    const updated = db.updateAssessment(id, body, actor);
    res.json({ assessment: updated, message: 'Assessment updated successfully' });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// DELETE /api/assessments/:id (Admin, Super Admin)
router.delete('/:id', requireRole(['super_admin', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const id = String(req.params.id);

  try {
    const removed = db.deleteAssessment(id, actor);
    res.json({ assessment: removed, message: 'Assessment deleted successfully' });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// POST /api/assessments (Trainer, Admin, Super Admin)
router.post('/', requireRole(['super_admin', 'admin', 'trainer']), (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const body = req.body;

  if (!body.title || typeof body.title !== 'string' || body.title.trim().length < 3) {
    return res.status(400).json({ error: 'Title must be at least 3 characters long' });
  }

  if (!body.courseId) {
    return res.status(400).json({ error: 'Course is required' });
  }

  const course = db.getCourses().find(c => c.id === body.courseId);
  if (!course) {
    return res.status(400).json({ error: 'Selected course does not exist' });
  }

  const durationMinutes = Number(body.durationMinutes) || 60;
  const totalPoints = Number(body.totalPoints) || 100;
  const passPercentage = Number(body.passPercentage) || 75;

  if (passPercentage < 1 || passPercentage > 100) {
    return res.status(400).json({ error: 'Pass percentage must be between 1 and 100' });
  }

  const questions = Array.isArray(body.questions) && body.questions.length > 0 
    ? body.questions 
    : [
        {
          id: `q_${Date.now()}_1`,
          prompt: 'Demonstrate your architectural understanding of the course core principles.',
          type: 'open_ended',
          rubricCriteria: 'Assesses depth of concept explanation, clarity, and applicability.',
          points: totalPoints
        }
      ];

  const newAssessment: Assessment = {
    id: `asm_${Date.now()}`,
    title: body.title.trim(),
    courseId: body.courseId,
    courseTitle: course.title,
    description: body.description || '',
    type: body.type || 'Quiz',
    durationMinutes,
    totalPoints,
    passPercentage,
    dueDate: body.dueDate || new Date(Date.now() + 14 * 86400000).toISOString(),
    questions,
    createdAt: new Date().toISOString()
  };

  const created = db.createAssessment(newAssessment, actor);
  res.status(201).json({ assessment: created, message: 'Assessment created successfully' });
});

// GET /api/assessments/:id/submissions
router.get('/:id/submissions', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const { id } = req.params;
  let submissions = db.getSubmissions().filter(s => s.assessmentId === id);

  // If learner, only show their own
  if (actor.role === 'learner') {
    submissions = submissions.filter(s => s.userId === actor.id);
  }

  res.json({ submissions });
});

// POST /api/assessments/:id/submit
router.post('/:id/submit', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const { id } = req.params;
  const assessment = db.getAssessments().find(a => a.id === id);

  if (!assessment) {
    return res.status(404).json({ error: 'Assessment not found' });
  }

  // Learner permission check
  if (actor.role === 'learner') {
    const publishedCourseIds = new Set(db.getCourses().filter(c => c.isPublished).map(c => c.id));
    const enrolledCourseIds = new Set(db.getProgress().filter(p => p.userId === actor.id).map(p => p.courseId));
    
    if (!publishedCourseIds.has(assessment.courseId) && !enrolledCourseIds.has(assessment.courseId)) {
      return res.status(403).json({ error: 'Forbidden: You are not enrolled in this assessment course' });
    }
  }

  const answers = req.body.answers || {};

  // Auto-calculate score for multiple-choice questions
  let autoScore = 0;
  let hasManualQuestions = false;

  assessment.questions.forEach(q => {
    if (q.type === 'multiple_choice') {
      if (answers[q.id] !== undefined && Number(answers[q.id]) === q.correctOptionIndex) {
        autoScore += q.points;
      }
    } else {
      hasManualQuestions = true;
    }
  });

  const submission: AssessmentSubmission = {
    id: `sub_${actor.id}_${assessment.id}`,
    assessmentId: assessment.id,
    assessmentTitle: assessment.title,
    userId: actor.id,
    userName: actor.name,
    answers,
    submittedAt: new Date().toISOString(),
    status: hasManualQuestions ? 'pending_review' : 'graded',
    score: hasManualQuestions ? undefined : autoScore,
    totalPoints: assessment.totalPoints,
    feedback: hasManualQuestions ? 'Pending trainer evaluation' : 'Automated scoring completed'
  };

  const saved = db.submitAssessment(submission);

  db.addAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    action: 'SUBMIT_ASSESSMENT',
    module: 'Assessments',
    details: `Learner submitted assessment: "${assessment.title}" (${hasManualQuestions ? 'Pending Review' : `Auto-score: ${autoScore}/${assessment.totalPoints}`})`,
    status: 'SUCCESS'
  });

  // If automated scoring graded it immediately, notify the learner
  if (!hasManualQuestions) {
    db.addNotification({
      userId: actor.id,
      title: 'Assessment Auto-Graded',
      message: `Your quiz "${assessment.title}" scored ${autoScore} / ${assessment.totalPoints} points.`,
      type: 'assessment',
      isRead: false,
      isGlobal: false,
      link: '/assessments'
    });
  }

  res.json({ submission: saved, message: 'Assessment submitted successfully' });
});

// POST /api/assessments/submissions/:id/grade (Trainer, Admin, Super Admin)
router.post('/submissions/:id/grade', requireRole(['super_admin', 'admin', 'trainer']), (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const id = String(req.params.id);
  const { score, feedback } = req.body;

  if (score === undefined || isNaN(Number(score))) {
    return res.status(400).json({ error: 'Numeric score is required' });
  }

  try {
    const graded = db.gradeSubmission(id, Number(score), feedback || '', actor);
    res.json({ submission: graded, message: 'Grading submitted successfully' });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

export default router;

