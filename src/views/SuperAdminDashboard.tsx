import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserProfile, AuditLog, SystemSettings } from '../types';
import { 
  ShieldAlert, 
  Users, 
  Activity, 
  Settings, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Crown,
  Search
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, settingsRes, auditRes] = await Promise.all([
        fetch('/api/auth/users', { headers: { 'x-user-email': user?.email || '' } }),
        fetch('/api/settings'),
        fetch('/api/audit-logs?status=All', { headers: { 'x-user-email': user?.email || '' } })
      ]);

      if (usersRes.ok) {
        const u = await usersRes.json();
        setUsers(u.users || []);
      }
      if (settingsRes.ok) {
        const s = await settingsRes.json();
        setSettings(s.settings);
      }
      if (auditRes.ok) {
        const a = await auditRes.json();
        setAuditLogs(a.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/auth/users/${targetUserId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      console.error('Failed to change role:', e);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldAlert className="w-48 h-48 text-rose-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-widest">
              <Crown className="w-4 h-4 text-rose-400" />
              Root Privilege Level
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1">Super Admin Control Hub</h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Complete administrative authority over CAPACITY CONNECT. Managing role matrices, security boundaries, persistent audit records, and system-wide configurations.
            </p>
          </div>
          <div className="bg-slate-900/80 border border-rose-500/20 rounded-xl p-3.5 shrink-0 text-xs">
            <div className="text-slate-400 text-[11px]">Whitelisted Super Admin</div>
            <div className="font-mono text-emerald-400 font-bold mt-0.5">
              {settings?.superAdminEmail || 'venkatajaswanthsambangi@gmail.com'}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400/80 mt-1">
              <CheckCircle2 className="w-3 h-3" />
              Full Governance Enforced
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Users</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">{users.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Across 4 role hierarchies</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Governance</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2">
            {settings?.enforceRbacStrict ? 'Strict RBAC' : 'Permissive'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Immutable security rules</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Audit Logs</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">{auditLogs.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Retained for {settings?.auditRetentionDays || 90} days</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">AI Tutor Sandbox</span>
            <Settings className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 mt-2">Isolated</div>
          <div className="text-[11px] text-slate-500 mt-1">Zero DB/Admin access</div>
        </div>
      </div>

      {/* User Role Management Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-white">System User Directory & Role Assignment</h2>
            <p className="text-xs text-slate-400">Promote or adjust role privileges directly. Changes take effect instantaneously.</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search user or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Current Role</th>
                <th className="py-3 px-4">Super Admin Privileges</th>
                <th className="py-3 px-4 text-right">Adjust Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => {
                const isConfiguredSuper = u.email.toLowerCase() === settings?.superAdminEmail?.toLowerCase();
                return (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{u.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{u.department}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        u.role === 'super_admin' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        u.role === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        u.role === 'trainer' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {isConfiguredSuper ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                          <Crown className="w-3.5 h-3.5" /> Primary Root
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">Standard</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        disabled={isConfiguredSuper}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-slate-950 border border-slate-700 text-xs rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-rose-500 disabled:opacity-40"
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="trainer">Trainer</option>
                        <option value="learner">Learner</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Audit Activities */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-base font-bold text-white mb-1">Live Immutable Audit Stream</h2>
        <p className="text-xs text-slate-400 mb-4">Every administrative change, role escalation, or settings mutation is logged here.</p>
        <div className="space-y-2">
          {auditLogs.slice(0, 4).map((log) => (
            <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start justify-between text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">{log.action}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-emerald-400 font-mono text-[11px]">{log.actorEmail}</span>
                  <span className="text-slate-600">[{log.module}]</span>
                </div>
                <div className="text-slate-400 mt-1">{log.details}</div>
              </div>
              <div className="text-[10px] text-slate-500 font-mono shrink-0 ml-4">
                {new Date(log.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
