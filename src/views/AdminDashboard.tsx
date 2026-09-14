import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Course, TrainingCohort, UserProfile } from '../types';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  ArrowUpRight,
  Award
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (module: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [trainings, setTrainings] = useState<TrainingCohort[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, tRes, uRes] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/trainings'),
          fetch('/api/auth/users', { headers: { 'x-user-email': user?.email || '' } })
        ]);
        if (cRes.ok) setCourses((await cRes.json()).courses || []);
        if (tRes.ok) setTrainings((await tRes.json()).trainings || []);
        if (uRes.ok) setUsers((await uRes.json()).users || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const trainers = users.filter(u => u.role === 'trainer');
  const learners = users.filter(u => u.role === 'learner');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Operations Admin Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise capacity delivery, trainer allocations, and cohort progress.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('courses')}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Manage Courses
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            View Analytics
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Courses</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{courses.length}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" /> 100% Published & Active
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Cohorts</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{trainings.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Scheduled across Q3/Q4</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Certified Trainers</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{trainers.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Assigned to cohorts</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Learners</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{learners.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Enrolled across departments</div>
        </div>
      </div>

      {/* Cohorts Overview Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">Active Training Cohorts</h2>
          <button 
            onClick={() => onNavigate('trainings')}
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
          >
            All Cohorts <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {trainings.map(t => (
            <div key={t.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-white text-sm">{t.title}</div>
                <div className="text-xs text-emerald-400 mt-0.5">{t.courseTitle}</div>
                <div className="text-slate-400 text-xs mt-1">Trainer: <span className="text-slate-200">{t.trainerName}</span> • Schedule: {t.meetingSchedule}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-200">{t.enrolledLearnerIds.length} / {t.capacity} Learners</div>
                  <div className="text-[10px] text-slate-500">{t.status}</div>
                </div>
                <button
                  onClick={() => onNavigate('trainings')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium"
                >
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
