import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Lock, 
  ShieldCheck, 
  Check, 
  X, 
  Crown, 
  GraduationCap, 
  User, 
  LayoutDashboard 
} from 'lucide-react';

export const RbacView: React.FC = () => {
  const { role, isSuperAdmin } = useAuth();

  const permissions = [
    { feature: 'Super Admin HQ & System Whitelisting', super_admin: true, admin: false, trainer: false, learner: false },
    { feature: 'Assign / Revoke User Roles', super_admin: true, admin: false, trainer: false, learner: false },
    { feature: 'Manage System Settings & Governance Switches', super_admin: true, admin: false, trainer: false, learner: false },
    { feature: 'View Full Immutable Audit Trail', super_admin: true, admin: true, trainer: false, learner: false },
    { feature: 'Publish & Delete Courses', super_admin: true, admin: true, trainer: false, learner: false },
    { feature: 'Schedule Training Cohorts', super_admin: true, admin: true, trainer: true, learner: false },
    { feature: 'Author Course Modules & Syllabi', super_admin: true, admin: true, trainer: true, learner: false },
    { feature: 'Grade Assessment Submissions & Rubrics', super_admin: true, admin: true, trainer: true, learner: false },
    { feature: 'Validate & Endorse Competency Levels', super_admin: true, admin: true, trainer: true, learner: false },
    { feature: 'Dispatch Broadcast Notifications', super_admin: true, admin: true, trainer: true, learner: false },
    { feature: 'View Institutional Analytics & Reports', super_admin: true, admin: true, trainer: true, learner: false },
    { feature: 'Enroll in Training Cohorts', super_admin: true, admin: true, trainer: true, learner: true },
    { feature: 'Take Assessments & Submit Tests', super_admin: true, admin: true, trainer: true, learner: true },
    { feature: 'Track Personal Learning Progress', super_admin: true, admin: true, trainer: true, learner: true },
    { feature: 'Consult AI Learning Tutor (Gemini)', super_admin: true, admin: true, trainer: true, learner: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Role-Based Access Control (RBAC) Matrix</h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise authorization hierarchy across Super Admin, Operations Admin, Trainer, and Learner.
          </p>
        </div>
      </div>

      {/* Role Definitions Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase">
            <Crown className="w-4 h-4" /> Super Admin
          </div>
          <p className="text-xs text-slate-300">
            Root architectural authority. Can promote users, modify security switches, whitelist administrative emails, and inspect complete audit streams.
          </p>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
            <LayoutDashboard className="w-4 h-4" /> Admin
          </div>
          <p className="text-xs text-slate-300">
            Institutional operations manager. Manages course catalogs, trainer allocations, departmental enrollments, and compliance reports.
          </p>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
            <GraduationCap className="w-4 h-4" /> Trainer
          </div>
          <p className="text-xs text-slate-300">
            Curriculum instructor. Authors syllabus modules, conducts cohort sessions, evaluates exam submissions, and validates learner competencies.
          </p>
        </div>

        <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase">
            <User className="w-4 h-4" /> Learner
          </div>
          <p className="text-xs text-slate-300">
            Capacity trainee. Enrolls in courses, studies interactive lessons, completes assessments, and consults the AI tutor.
          </p>
        </div>
      </div>

      {/* Permissions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/60">
              <tr>
                <th className="py-3.5 px-4">Feature / Operation Authority</th>
                <th className="py-3.5 px-4 text-center text-rose-400">Super Admin</th>
                <th className="py-3.5 px-4 text-center text-amber-400">Admin</th>
                <th className="py-3.5 px-4 text-center text-emerald-400">Trainer</th>
                <th className="py-3.5 px-4 text-center text-blue-400">Learner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {permissions.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 text-slate-200 font-medium">
                    {p.feature}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {p.super_admin ? (
                      <Check className="w-4 h-4 text-rose-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {p.admin ? (
                      <Check className="w-4 h-4 text-amber-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {p.trainer ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {p.learner ? (
                      <Check className="w-4 h-4 text-blue-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
