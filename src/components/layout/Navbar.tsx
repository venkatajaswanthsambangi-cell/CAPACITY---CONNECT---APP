import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, NotificationItem } from '../../types';
import { 
  ShieldCheck, 
  Bell, 
  Sparkles, 
  ChevronDown, 
  LogOut, 
  User, 
  Check, 
  Building2,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  currentModule: string;
  onSelectModule: (moduleId: string) => void;
  isMobileOpen?: boolean;
  onToggleMobile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentModule, 
  onSelectModule,
  isMobileOpen,
  onToggleMobile
}) => {
  const { user, role, isSuperAdmin, switchDemoRole, logout } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/notifications', {
      headers: { 'x-user-email': user.email }
    })
      .then(res => res.json())
      .then(data => {
        if (data.notifications) setNotifications(data.notifications);
      })
      .catch(console.error);
  }, [user, currentModule]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = async () => {
    if (!user) return;
    for (const notif of notifications.filter(n => !n.isRead)) {
      await fetch(`/api/notifications/read/${notif.id}`, {
        method: 'POST',
        headers: { 'x-user-email': user.email }
      });
    }
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const roleColors: Record<UserRole, { bg: string; text: string; border: string }> = {
    super_admin: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
    admin: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    trainer: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    learner: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' }
  };

  const currentRoleStyle = roleColors[role] || roleColors.learner;

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand Identity & Mobile Drawer Toggle */}
      <div className="flex items-center gap-2 md:gap-3">
        {onToggleMobile && (
          <button
            onClick={onToggleMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden focus:outline-none focus:ring-1 focus:ring-emerald-500"
            aria-label="Toggle navigation menu"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-950/40 shrink-0">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-white text-base md:text-lg">CAPACITY CONNECT</span>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Enterprise
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden lg:block">Institutional Capacity Building & Governance Architecture</p>
        </div>
      </div>

      {/* Center Actions / Quick Switcher */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Role Switcher Button for Instant Verification */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${currentRoleStyle.bg} ${currentRoleStyle.text} ${currentRoleStyle.border} hover:opacity-90`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="capitalize">{role.replace('_', ' ')}</span>
            {isSuperAdmin && role === 'super_admin' && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            )}
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Switch Role Context
              </div>
              {(['super_admin', 'admin', 'trainer', 'learner'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchDemoRole(r);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors hover:bg-slate-800/60 ${
                    role === r ? 'text-white font-medium bg-slate-800/40' : 'text-slate-300'
                  }`}
                >
                  <span className="capitalize">{r.replace('_', ' ')}</span>
                  {role === r && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              ))}
              <div className="px-3 pt-2 mt-1 border-t border-slate-800/80 text-[10px] text-slate-500">
                Super Admin target email:
                <br />
                <span className="font-mono text-emerald-400/80 truncate block">venkatajaswanthsambangi@gmail.com</span>
              </div>
            </div>
          )}
        </div>

        {/* AI Learning Assistant Fast-Launch Button */}
        <button
          onClick={() => onSelectModule('ai_assistant')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-medium transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden md:inline">AI Tutor</span>
        </button>

        {/* Notification Icon */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            )}
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2 flex items-center justify-between border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200">Notifications ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-emerald-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/50">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">No notifications yet.</div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (notif.link) onSelectModule(notif.link.replace('/', ''));
                        setShowNotifMenu(false);
                      }}
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-800/40 transition-colors ${
                        notif.isRead ? 'opacity-60' : 'bg-slate-800/20'
                      }`}
                    >
                      <div className="font-semibold text-slate-200">{notif.title}</div>
                      <div className="text-slate-400 mt-1 line-clamp-2">{notif.message}</div>
                      <div className="text-[10px] text-slate-500 mt-1.5">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile avatar & menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-slate-700 transition-all"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                {user?.name.charAt(0) || 'U'}
              </div>
            )}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2.5 border-b border-slate-800">
                <div className="font-semibold text-sm text-white truncate">{user?.name}</div>
                <div className="text-xs text-slate-400 font-mono truncate">{user?.email}</div>
                <div className="text-[11px] text-emerald-400 mt-1">{user?.department}</div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onSelectModule('profile');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    onSelectModule('system_settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  System Governance
                </button>
              </div>

              <div className="pt-1 border-t border-slate-800">
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
