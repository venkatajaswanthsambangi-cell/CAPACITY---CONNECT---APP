import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Course, TrainingCohort, AssessmentSubmission } from '../types';
import { 
  GraduationCap, 
  ClipboardCheck, 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Award,
  ChevronRight
} from 'lucide-react';

interface TrainerDashboardProps {
  onNavigate: (module: string) => void;
}

export const TrainerDashboard: React.FC<TrainerDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [trainings, setTrainings] = useState<TrainingCohort[]>([]);
  const [submissions, setSubmissions] = useState<AssessmentSubmission[]>([]);
  const [selectedSub, setSelectedSub] = useState<AssessmentSubmission | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(90);
  const [gradeFeedback, setGradeFeedback] = useState<string>('Strong performance with clear technical understanding.');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  const loadData = async () => {
    try {
      const [cRes, tRes, subRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/trainings'),
        fetch('/api/assessments/asm_cloud_midterm/submissions', {
          headers: { 'x-user-email': user?.email || '' }
        })
      ]);
      if (cRes.ok) setCourses((await cRes.json()).courses || []);
      if (tRes.ok) setTrainings((await tRes.json()).trainings || []);
      if (subRes.ok) setSubmissions((await subRes.json()).submissions || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleGradeSubmit = async () => {
    if (!selectedSub) return;
    setSubmittingGrade(true);
    try {
      const res = await fetch(`/api/assessments/submissions/${selectedSub.id}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({
          score: gradeScore,
          feedback: gradeFeedback
        })
      });
      if (res.ok) {
        setSelectedSub(null);
        loadData();
      }
    } finally {
      setSubmittingGrade(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Trainer Instruction Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Manage assigned courses, cohort sessions, and learner assessment reviews.</p>
        </div>
        <button
          onClick={() => onNavigate('assessments')}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40 self-start"
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          Assessments & Rubrics
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Assigned Courses</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{courses.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Curriculum active</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Cohort Delivery</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{trainings.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Live training tracks</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Submissions Queue</span>
            <ClipboardCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{submissions.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Grading & feedback items</div>
        </div>
      </div>

      {/* Submissions Review Queue */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-base font-bold text-white mb-1">Learner Submission Grading Queue</h2>
        <p className="text-xs text-slate-400 mb-4">Review submitted practical assignments and multiple-choice tests with rubric feedback.</p>

        {submissions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No pending submissions.</div>
        ) : (
          <div className="space-y-3">
            {submissions.map(sub => (
              <div key={sub.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{sub.assessmentTitle}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      sub.status === 'graded' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Learner: <span className="text-slate-200 font-medium">{sub.userName}</span></div>
                  <div className="text-xs text-slate-500 mt-1">
                    Submitted: {new Date(sub.submittedAt).toLocaleDateString()} • Points: {sub.score !== undefined ? `${sub.score} / ${sub.totalPoints}` : `Max ${sub.totalPoints}`}
                  </div>
                  {sub.feedback && (
                    <div className="mt-2 text-xs bg-slate-900 border border-slate-800 rounded p-2 text-slate-300">
                      Feedback: {sub.feedback}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedSub(sub);
                    setGradeScore(sub.score || 90);
                    setGradeFeedback(sub.feedback || 'Outstanding work.');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium shrink-0 self-start md:self-center"
                >
                  {sub.status === 'graded' ? 'Update Grade' : 'Grade Submission'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grading Modal */}
      {selectedSub && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Grading: {selectedSub.assessmentTitle}</h3>
            <div className="text-xs text-slate-400">Learner: <span className="text-slate-200">{selectedSub.userName}</span></div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="font-bold text-slate-300">Submitted Answers:</div>
              <pre className="text-[11px] text-slate-400 whitespace-pre-wrap font-sans">
                {JSON.stringify(selectedSub.answers, null, 2)}
              </pre>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Score (Max {selectedSub.totalPoints})
              </label>
              <input
                type="number"
                min="0"
                max={selectedSub.totalPoints}
                value={gradeScore}
                onChange={(e) => setGradeScore(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Rubric Feedback & Guidance
              </label>
              <textarea
                rows={3}
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedSub(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleGradeSubmit}
                disabled={submittingGrade}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
              >
                {submittingGrade ? 'Saving...' : 'Save & Publish Grade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
