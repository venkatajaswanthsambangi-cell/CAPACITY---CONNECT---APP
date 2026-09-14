import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Course, LearnerProgress, LearnerCompetencyStatus, Assessment } from '../types';
import { 
  BookOpen, 
  Award, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';

interface LearnerDashboardProps {
  onNavigate: (module: string) => void;
}

export const LearnerDashboard: React.FC<LearnerDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<LearnerProgress[]>([]);
  const [competencies, setCompetencies] = useState<LearnerCompetencyStatus[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, pRes, compRes, aRes] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/progress', { headers: { 'x-user-email': user?.email || '' } }),
          fetch('/api/competencies/learner', { headers: { 'x-user-email': user?.email || '' } }),
          fetch('/api/assessments')
        ]);
        if (cRes.ok) setCourses((await cRes.json()).courses || []);
        if (pRes.ok) setProgress((await pRes.json()).progress || []);
        if (compRes.ok) setCompetencies((await compRes.json()).statuses || []);
        if (aRes.ok) setAssessments((await aRes.json()).assessments || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-blue-400">Learner Workspace</span>
          <h1 className="text-2xl font-extrabold text-white mt-1">Welcome back, {user?.name || 'Learner'}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track your enterprise learning pathway, competency milestones, and upcoming assessments.
          </p>
        </div>
        <button
          onClick={() => onNavigate('ai_assistant')}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-950/40 shrink-0 self-start md:self-center transition-all"
        >
          <Sparkles className="w-4 h-4 text-purple-200" />
          Ask AI Learning Tutor
        </button>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Courses Enrolled</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{progress.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Active learning tracks</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Verified Competencies</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">{competencies.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Levels 1-5 validated by trainers</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pending Tests</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{assessments.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Available for grading</div>
        </div>
      </div>

      {/* In-Progress Courses */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">My Learning Pathways</h2>
          <button
            onClick={() => onNavigate('courses')}
            className="text-xs text-blue-400 hover:underline flex items-center gap-1"
          >
            Explore Catalog <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4">
          {courses.slice(0, 3).map((course) => {
            const prog = progress.find(p => p.courseId === course.id);
            const percent = prog ? prog.progressPercentage : 25;

            return (
              <div key={course.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{course.title}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">{course.code}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{course.description}</div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3 max-w-md">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Completion Progress</span>
                      <span className="font-bold text-emerald-400">{percent}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('progress')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shrink-0 self-start md:self-center"
                >
                  Resume Learning
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Competencies Progress Widget */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-base font-bold text-white mb-1">My Competency Matrix Status</h2>
        <p className="text-xs text-slate-400 mb-4">Enterprise skill benchmarks verified against organizational rubrics.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competencies.map(comp => (
            <div key={comp.competencyId} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{comp.competencyName}</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                  Level {comp.currentLevel} / 5
                </span>
              </div>
              <div className="flex gap-1.5 mt-3">
                {[1, 2, 3, 4, 5].map(lvl => (
                  <div
                    key={lvl}
                    className={`h-2 flex-1 rounded-full ${
                      lvl <= comp.currentLevel ? 'bg-emerald-500' : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                Validated by {comp.verifiedBy || 'Trainer'} on {new Date(comp.verifiedAt || '').toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
