import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Calendar,
  Download,
  Search,
  FileSpreadsheet,
  Printer
} from 'lucide-react';

interface LearnerSummary {
  userId: string;
  name: string;
  email: string;
  department: string;
  title: string;
  enrolledCoursesCount: number;
  completedCoursesCount: number;
  averageAssessmentScore: number | null;
  certificatesEarned: number;
}

export const ReportsView: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [data, setData] = useState<any>(null);
  const [learners, setLearners] = useState<LearnerSummary[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const headers = { 'x-user-email': user?.email || '' };
    Promise.all([
      fetch('/api/reports/analytics', { headers }),
      fetch('/api/reports/learner-summary', { headers })
    ])
      .then(async ([aRes, lRes]) => {
        if (aRes.ok) {
          const aData = await aRes.json();
          setData(aData);
        }
        if (lRes.ok) {
          const lData = await lRes.json();
          setLearners(lData.learners || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleExportData = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/reports/export', {
        headers: { 'x-user-email': user?.email || '' }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `capacity-connect-institutional-report-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs bg-slate-900 border border-slate-800 rounded-2xl">
        Loading capacity analytics & institutional metrics...
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const depts = data?.departmentBreakdown || {};
  const categories = data?.courseCategories || {};

  const filteredLearners = learners.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-emerald-400" />
            Reports & Institutional Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time organizational learning metrics, assessment pass rates, and competency distribution.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
          >
            <Printer className="w-4 h-4" />
            <span>Print View</span>
          </button>

          {hasRole(['admin', 'super_admin']) && (
            <button
              disabled={exporting}
              onClick={handleExportData}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{exporting ? 'Exporting...' : 'Export Full Report (JSON)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Enrolled Learners</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">{kpis.totalLearners}</div>
          <div className="text-[11px] text-slate-500 mt-1">{kpis.totalTrainers} certified enterprise trainers</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Average Curriculum Completion</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2">{kpis.averageCompletionRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">{kpis.completedCourses} courses fully completed</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Assessment Average</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">{kpis.averageScore} / 100</div>
          <div className="text-[11px] text-slate-500 mt-1">Institutional passing standard: 75%</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Cohorts</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">{kpis.activeCohorts}</div>
          <div className="text-[11px] text-slate-500 mt-1">Covering {kpis.totalCourses} accredited courses</div>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center justify-between">
            <span>Department Learner Distribution</span>
            <span className="text-xs text-slate-400 font-normal">{Object.keys(depts).length} departments</span>
          </h2>
          <div className="space-y-3">
            {Object.entries(depts).map(([dept, count]: any) => (
              <div key={dept} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{dept}</span>
                  <span className="font-bold text-white">{count} users</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, Math.max(10, count * 20))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Curriculum Categories */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center justify-between">
            <span>Domain Competency Tracks</span>
            <span className="text-xs text-slate-400 font-normal">{Object.keys(categories).length} categories</span>
          </h2>
          <div className="space-y-3">
            {Object.entries(categories).map(([cat, count]: any) => (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{cat}</span>
                  <span className="font-bold text-white">{count} courses</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, Math.max(15, count * 35))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learner Performance Summary Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white">Learner Academic Standing & Progress</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Individual audit metrics for enrolled professionals across technical disciplines.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter learner or dept..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Learner</th>
                <th className="pb-3 font-semibold">Department</th>
                <th className="pb-3 font-semibold">Tracks Enrolled</th>
                <th className="pb-3 font-semibold">Completed</th>
                <th className="pb-3 font-semibold">Avg Assessment</th>
                <th className="pb-3 font-semibold">Certificates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLearners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No learners found matching search.
                  </td>
                </tr>
              ) : (
                filteredLearners.map(l => (
                  <tr key={l.userId} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3">
                      <div className="font-bold text-white">{l.name}</div>
                      <div className="text-[11px] text-slate-500">{l.email}</div>
                    </td>
                    <td className="py-3 text-slate-300">
                      <div>{l.department}</div>
                      <div className="text-[10px] text-slate-500">{l.title}</div>
                    </td>
                    <td className="py-3 font-semibold text-slate-300">{l.enrolledCoursesCount} tracks</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                        l.completedCoursesCount > 0 
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {l.completedCoursesCount} completed
                      </span>
                    </td>
                    <td className="py-3">
                      {l.averageAssessmentScore !== null ? (
                        <span className={`font-bold ${
                          l.averageAssessmentScore >= 75 ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {l.averageAssessmentScore}%
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">No exams taken</span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Award className="w-3.5 h-3.5 text-purple-400" />
                        <span className="font-bold">{l.certificatesEarned}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
