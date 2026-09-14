import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LearnerProgress, Course, UserProfile } from '../types';
import { 
  TrendingUp, 
  CheckCircle2, 
  Circle, 
  Award, 
  BookOpen, 
  Calendar, 
  ShieldCheck,
  Download,
  Users,
  X,
  Check,
  Clock
} from 'lucide-react';

interface ProgressSummary {
  userId: string;
  enrolledCount: number;
  completedCount: number;
  inProgressCount: number;
  averagePercentage: number;
  certificatesEarned: Array<{
    courseId: string;
    certificateId?: string;
    completedAt?: string;
  }>;
}

export const ProgressView: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [progressList, setProgressList] = useState<LearnerProgress[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Trainer/Admin learner inspection
  const [learners, setLearners] = useState<UserProfile[]>([]);
  const [inspectedUserId, setInspectedUserId] = useState<string>('');
  
  // Certificate Modal
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [certificateCourse, setCertificateCourse] = useState<Course | null>(null);

  const canInspectLearners = hasRole(['trainer', 'admin', 'super_admin']);

  const loadData = async () => {
    try {
      const headers = { 'x-user-email': user?.email || '' };
      const targetUserQuery = inspectedUserId ? `?userId=${inspectedUserId}` : '';

      const [pRes, cRes, sRes] = await Promise.all([
        fetch(`/api/progress${targetUserQuery}`, { headers }),
        fetch('/api/courses', { headers }),
        fetch(`/api/progress/summary${targetUserQuery}`, { headers })
      ]);

      if (pRes.ok) {
        const p = await pRes.json();
        setProgressList(p.progress || []);
      }
      if (cRes.ok) {
        const c = await cRes.json();
        setCourses(c.courses || []);
        if (c.courses?.length > 0 && !selectedCourseId) {
          setSelectedCourseId(c.courses[0].id);
        }
      }
      if (sRes.ok) {
        const s = await sRes.json();
        setSummary(s.summary || null);
      }

      if (canInspectLearners && learners.length === 0) {
        const uRes = await fetch('/api/auth/users', { headers });
        if (uRes.ok) {
          const u = await uRes.json();
          setLearners((u.users || []).filter((usr: UserProfile) => usr.role === 'learner'));
        }
      }
    } catch (e) {
      console.error('Failed to load progress data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, inspectedUserId]);

  const toggleLesson = async (courseId: string, lessonId: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/progress/complete-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify({ courseId, lessonId })
      });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      console.error('Failed to toggle lesson:', e);
    }
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId) || courses[0];
  const activeProg = progressList.find(p => p.courseId === selectedCourse?.id);
  const completedLessons = activeProg?.completedLessonIds || [];
  const percent = activeProg?.progressPercentage || 0;

  const handleOpenCertificate = (course: Course) => {
    setCertificateCourse(course);
    setCertificateModalOpen(true);
  };

  const targetName = inspectedUserId 
    ? (learners.find(l => l.id === inspectedUserId)?.name || 'Selected Learner')
    : (user?.name || 'Learner');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-emerald-400" />
            Learner Progress & Curriculum Completion
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track and verify modular lesson completions across active institutional learning tracks.
          </p>
        </div>

        {/* Trainer / Admin Learner Switcher */}
        {canInspectLearners && (
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs shrink-0">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400 font-medium">Inspect Learner:</span>
            <select
              value={inspectedUserId}
              onChange={(e) => setInspectedUserId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-500"
            >
              <option value="">Myself ({user?.name})</option>
              {learners.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.email})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Enrolled Tracks</span>
              <BookOpen className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">{summary.enrolledCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">Institutional courses</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Completed Tracks</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-2">{summary.completedCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">100% curriculum verified</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Average Progress</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-amber-400 mt-2">{summary.averagePercentage}%</div>
            <div className="text-[11px] text-slate-500 mt-1">Across all enrolled syllabi</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Certificates Awarded</span>
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-extrabold text-purple-400 mt-2">{summary.certificatesEarned.length}</div>
            <div className="text-[11px] text-slate-500 mt-1">Accredited credentials</div>
          </div>
        </div>
      )}

      {/* Course Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {courses.map(c => {
          const prog = progressList.find(p => p.courseId === c.id);
          const isSelected = selectedCourse?.id === c.id;
          const pVal = prog ? prog.progressPercentage : 0;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCourseId(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>{c.title}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-emerald-400'
              }`}>
                {pVal}%
              </span>
            </button>
          );
        })}
      </div>

      {selectedCourse && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Lessons Checklist */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {selectedCourse.code}
                    </span>
                    <h2 className="text-base font-bold text-white">{selectedCourse.title}</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{selectedCourse.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl font-extrabold text-emerald-400">{percent}%</span>
                  <div className="text-[10px] text-slate-500">Curriculum Progress</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden mb-6 border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Modules breakdown */}
              <div className="space-y-4">
                {selectedCourse.modules.map((mod, modIdx) => (
                  <div key={mod.id} className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-emerald-300">
                        Module {modIdx + 1}: {mod.title}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {mod.lessons.filter(l => completedLessons.includes(l.id)).length} / {mod.lessons.length} Completed
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{mod.description}</p>

                    <div className="space-y-2 pt-2">
                      {mod.lessons.map(lesson => {
                        const isDone = completedLessons.includes(lesson.id);
                        return (
                          <div
                            key={lesson.id}
                            onClick={() => toggleLesson(selectedCourse.id, lesson.id)}
                            className={`p-3 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition-all ${
                              isDone
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                              )}
                              <span className={isDone ? 'line-through opacity-80' : ''}>{lesson.title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{lesson.durationMinutes}m</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Certificate & Milestone Card */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-lg">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Institutional Certification</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Issued upon 100% completion of modular curriculum and passing graded assessment benchmarks.
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-left space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Learner:</span>
                  <strong className="text-slate-200">{targetName}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Status:</span>
                  <strong className={percent === 100 ? 'text-emerald-400' : 'text-amber-400'}>
                    {percent === 100 ? 'Certified' : 'In Progress'}
                  </strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Track Code:</span>
                  <strong className="text-slate-200 font-mono">{selectedCourse.code}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Credential ID:</span>
                  <strong className="text-slate-300 font-mono">
                    {activeProg?.certificateId || (percent === 100 ? `CERT-${selectedCourse.code}-VERIFIED` : 'Pending Completion')}
                  </strong>
                </div>
              </div>

              <button
                disabled={percent < 100}
                onClick={() => handleOpenCertificate(selectedCourse)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow"
              >
                <Download className="w-4 h-4" />
                {percent === 100 ? 'View & Download Certificate' : 'Complete All Lessons to Unlock (100%)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Certificate Modal */}
      {certificateModalOpen && certificateCourse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl w-full max-w-xl p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setCertificateModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Frame */}
            <div className="border-4 border-double border-emerald-500/40 p-8 rounded-xl bg-slate-950 text-center space-y-4">
              <div className="text-emerald-400 font-bold uppercase tracking-widest text-xs">
                Capacity Connect Institutional Credential
              </div>
              <h2 className="text-2xl font-serif text-white font-bold">Certificate of Mastery</h2>
              <p className="text-xs text-slate-400 italic">This is officially accredited to certify that</p>
              <div className="text-xl font-bold text-emerald-300 border-b border-emerald-500/30 pb-2 inline-block px-8">
                {targetName}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                has successfully fulfilled all institutional criteria and demonstrated technical competence in
              </p>
              <div className="text-base font-bold text-white">
                {certificateCourse.title} ({certificateCourse.code})
              </div>
              <div className="pt-4 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
                <span>Date: {new Date().toLocaleDateString()}</span>
                <span>Verification ID: CERT-{certificateCourse.code}-{Date.now().toString().slice(-6)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCertificateModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Print / Save Credential</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
