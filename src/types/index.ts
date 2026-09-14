export type UserRole = 'super_admin' | 'admin' | 'trainer' | 'learner';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  title: string;
  avatarUrl?: string;
  phoneNumber?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

export interface RolePermission {
  role: UserRole;
  displayName: string;
  description: string;
  permissions: string[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  content: string;
  resourceUrls?: string[];
  order: number;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Executive';
  durationHours: number;
  instructorId: string;
  instructorName: string;
  thumbnailUrl: string;
  modules: CourseModule[];
  competencyIds: string[];
  isPublished: boolean;
  enrolledCount: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingCohort {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  trainerId: string;
  trainerName: string;
  startDate: string;
  endDate: string;
  meetingSchedule: string;
  location: string;
  capacity: number;
  enrolledLearnerIds: string[];
  status: 'Upcoming' | 'Active' | 'Completed';
  createdAt: string;
}

export interface LearningResource {
  id: string;
  title: string;
  category: 'Guide' | 'Documentation' | 'Video' | 'Template' | 'Research';
  description: string;
  url: string;
  fileSize?: string;
  tags: string[];
  authorName: string;
  downloadCount: number;
  createdAt: string;
}

export interface AssessmentQuestion {
  id: string;
  prompt: string;
  type: 'multiple_choice' | 'open_ended';
  options?: string[];
  correctOptionIndex?: number;
  rubricCriteria?: string;
  points: number;
}

export interface Assessment {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  moduleId?: string;
  description: string;
  type: 'Quiz' | 'Practical_Assignment' | 'Final_Project';
  durationMinutes: number;
  totalPoints: number;
  passPercentage: number;
  dueDate: string;
  questions: AssessmentQuestion[];
  createdAt: string;
}

export interface AssessmentSubmission {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  userId: string;
  userName: string;
  answers: Record<string, string | number>;
  submittedAt: string;
  status: 'submitted' | 'graded' | 'pending_review';
  score?: number;
  totalPoints: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
}

export interface LearnerProgress {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedLessonIds: string[];
  progressPercentage: number;
  lastAccessedAt: string;
  isCompleted: boolean;
  completedAt?: string;
  certificateId?: string;
}

export interface CompetencyLevel {
  level: number;
  name: string;
  description: string;
  criteria: string[];
}

export interface Competency {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  levels: CompetencyLevel[];
  relatedCourseIds: string[];
  createdAt: string;
}

export interface LearnerCompetencyStatus {
  userId: string;
  competencyId: string;
  competencyName: string;
  currentLevel: number;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'assessment' | 'system' | 'alert';
  isRead: boolean;
  isGlobal: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export interface SystemSettings {
  superAdminEmail: string;
  organizationName: string;
  defaultUserRole: UserRole;
  allowSelfRegistration: boolean;
  aiModel: string;
  auditRetentionDays: number;
  enforceRbacStrict: boolean;
  supportContactEmail: string;
  maintenanceMode: boolean;
  aiAssistantEnabled?: boolean;
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  contextCourseId?: string;
}
