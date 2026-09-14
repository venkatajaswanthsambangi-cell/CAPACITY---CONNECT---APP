import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserProfile, UserRole } from '../types';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  Crown, 
  Mail, 
  Building2, 
  Briefcase 
} from 'lucide-react';

export const UserDirectoryView: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/users', {
        headers: { 'x-user-email': user?.email || '' }
      });
      if (res.ok) {
        const d = await res.json();
        setUsers(d.users || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [user]);

  const filtered: UserProfile[] = users.filter((u: UserProfile) => {
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesSearch = (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
                          (u.department || '').toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Enterprise User Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered personnel, institutional roles, assigned departments, and active statuses.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['All', 'super_admin', 'admin', 'trainer', 'learner'].map((r: string) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                roleFilter === r
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {r === 'All' ? 'All Roles' : r.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, department..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((u: UserProfile) => (
          <div key={u.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
            <div className="flex items-start gap-3">
              {u.avatarUrl ? (
                <img src={u.avatarUrl} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-300 shrink-0">
                  {u.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-sm font-bold text-white truncate">{u.name}</h3>
                  {u.role === 'super_admin' && <Crown className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                </div>
                <div className="text-xs text-slate-400 font-mono truncate">{u.email}</div>
                <div className="text-[11px] text-slate-300 mt-1">{u.title}</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">{u.department}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                u.role === 'super_admin' ? 'bg-rose-500/20 text-rose-400' :
                u.role === 'admin' ? 'bg-amber-500/20 text-amber-400' :
                u.role === 'trainer' ? 'bg-emerald-500/20 text-emerald-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {u.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
