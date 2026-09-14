import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/reports/analytics (Admin, Super Admin, Trainer)
router.get('/analytics', requireRole(['super_admin', 'admin', 'trainer']), (req: AuthenticatedRequest, res: Response) => {
  const users = db.getUsers();
  const courses = db.getCourses();
  const trainings = db.getTrainings();
  const progress = db.getProgress();
  const assessments = db.getAssessments();
  const submissions = db.getSubmissions();
  const competencies = db.getCompetencies();

  const totalLearners = users.filter(u => u.role === 'learner').length;
  const totalTrainers = users.filter(u => u.role === 'trainer').length;
  const totalAdmins = users.filter(u => u.role === 'admin' || u.role === 'super_admin').length;

  const totalEnrollments = progress.length;
  const completedCourses = progress.filter(p => p.isCompleted).length;
  const averageCompletionRate = totalEnrollments > 0 
    ? Math.round((progress.reduce((acc, p) => acc + p.progressPercentage, 0) / totalEnrollments)) 
    : 0;

  const gradedSubmissions = submissions.filter(s => s.status === 'graded');
  const averageScore = gradedSubmissions.length > 0 
    ? Math.round(gradedSubmissions.reduce((acc, s) => acc + (s.score || 0), 0) / gradedSubmissions.length) 
    : 85;

  const departmentCounts: Record<string, number> = {};
  users.forEach(u => {
    departmentCounts[u.department] = (departmentCounts[u.department] || 0) + 1;
  });

  const categoryCounts: Record<string, number> = {};
  courses.forEach(c => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  res.json({
    kpis: {
      totalUsers: users.length,
      totalLearners,
      totalTrainers,
      totalAdmins,
      totalCourses: courses.length,
      activeCohorts: trainings.filter(t => t.status === 'Active').length,
      totalEnrollments,
      completedCourses,
      averageCompletionRate,
      averageScore,
      totalCompetencies: competencies.length
    },
    departmentBreakdown: departmentCounts,
    courseCategories: categoryCounts,
    recentSubmissions: submissions.slice(0, 5)
  });
});

// GET /api/reports/learner-summary (Admin, Super Admin, Trainer)
router.get('/learner-summary', requireRole(['super_admin', 'admin', 'trainer']), (req: AuthenticatedRequest, res: Response) => {
  const users = db.getUsers().filter(u => u.role === 'learner');
  const allProgress = db.getProgress();
  const allSubmissions = db.getSubmissions();

  const summary = users.map(user => {
    const userProg = allProgress.filter(p => p.userId === user.id);
    const userSubs = allSubmissions.filter(s => s.userId === user.id && s.status === 'graded');
    const avgScore = userSubs.length > 0
      ? Math.round(userSubs.reduce((acc, s) => acc + (s.score || 0), 0) / userSubs.length)
      : null;

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      department: user.department,
      title: user.title,
      enrolledCoursesCount: userProg.length,
      completedCoursesCount: userProg.filter(p => p.isCompleted).length,
      averageAssessmentScore: avgScore,
      certificatesEarned: userProg.filter(p => p.certificateId).length
    };
  });

  res.json({ learners: summary });
});

// GET /api/reports/export (Admin, Super Admin)
router.get('/export', requireRole(['super_admin', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const users = db.getUsers();
  const courses = db.getCourses();
  const progress = db.getProgress();
  const submissions = db.getSubmissions();
  const competencies = db.getCompetencies();

  res.json({
    exportDate: new Date().toISOString(),
    organization: db.getSystemSettings().organizationName,
    metrics: {
      totalUsers: users.length,
      totalCourses: courses.length,
      totalEnrollments: progress.length,
      totalSubmissions: submissions.length,
      totalCompetencies: competencies.length
    },
    users: users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, department: u.department })),
    courses: courses.map(c => ({ id: c.id, code: c.code, title: c.title, category: c.category, level: c.level })),
    progress: progress.map(p => ({ userId: p.userId, courseId: p.courseId, percentage: p.progressPercentage, isCompleted: p.isCompleted }))
  });
});

export default router;
