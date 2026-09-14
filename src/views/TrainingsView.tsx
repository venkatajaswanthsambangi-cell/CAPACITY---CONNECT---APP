import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TrainingCohort, Course } from '../types';
import { 
  Calendar, 
  Plus, 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  UserPlus,
  AlertCircle
} from 'lucide-react';

export const TrainingsView: React.FC = () => {
  const { user, role, hasRole } = useAuth();
  const [trainings, setTrainings] = useState<TrainingCohort[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  // New cohort form
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [capacity, setCapacity] = useState(30);
  const [schedule, setSchedule] = useState('Tuesdays & Thursdays, 18:00 - 20:00 UTC');
  const [location, setLocation] = useState('Enterprise Virtual Lab A');

  const loadData = async () => {
    try {
      const [tRes, cRes] = await Promise.all([
        fetch('/api/trainings'),
        fetch('/api/courses')
      ]);
      if (tRes.ok) setTrainings((await tRes.json()).trainings || []);
      if (cRes.ok) setCourses((await cRes.json()).courses || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !courseId) return;

    try {
      const res = await fetch('/api/trainings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({
          title,
          courseId,
          capacity,
          meetingSchedule: schedule,
          location
        })
      });
      if (res.ok) {
        setShowCreateModal(false);
        setTitle('');
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEnroll = async (cohortId: string) => {
    setEnrollingId(cohortId);
    try {
      const res = await fetch(`/api/trainings/${cohortId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        }
      });
      if (res.ok) {
        loadData();
      }
    } finally {
      setEnrollingId(null);
    }
  };

  const canManage = hasRole(['trainer', 'admin', 'super_admin']);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Training Cohorts & Delivery</h1>
          <p className="text-xs text-slate-400 mt-1">
            Instructor-led training cohorts, schedules, virtual classroom links, and enrollment tracking.
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            Schedule New Cohort
          </button>
        )}
      </div>

      {/* Cohorts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trainings.map(t => {
          const isEnrolled = user && t.enrolledLearnerIds.includes(user.id);
          const isFull = t.enrolledLearnerIds.length >= t.capacity;

          return (
            <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {t.status}
                    </span>
                    <h3 className="text-base font-bold text-white mt-2">{t.title}</h3>
                    <div className="text-xs text-slate-300 font-medium mt-0.5">{t.courseTitle}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-white">{t.enrolledLearnerIds.length} / {t.capacity}</div>
                    <div className="text-[10px] text-slate-500">Seats filled</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>Lead Trainer: <strong className="text-slate-200">{t.trainerName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>{t.meetingSchedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-300 font-mono text-[11px]">{t.location}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Runs {t.startDate} to {t.endDate}
                </span>

                {isEnrolled ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" /> Enrolled in Track
                  </span>
                ) : (
                  <button
                    disabled={isFull || enrollingId === t.id}
                    onClick={() => handleEnroll(t.id)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    {isFull ? 'Cohort Full' : enrollingId === t.id ? 'Enrolling...' : 'Enroll in Cohort'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Cohort Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Schedule Training Cohort</h3>
            <form onSubmit={handleCreateCohort} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cohort Batch Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026 Q4 Cloud Architects Acceleration"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Associated Course</label>
                <select
                  required
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select course curriculum...</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Seat Capacity</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Virtual Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Meeting Schedule</label>
                <input
                  type="text"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
                >
                  Schedule Cohort
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
