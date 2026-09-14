import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  FileText, 
  ClipboardCheck, 
  TrendingUp, 
  Award, 
  Bell, 
  Sparkles, 
  BarChart3, 
  History, 
  Settings, 
  Users, 
  Lock,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  currentModule: string;
  onSelectModule: (moduleId: string) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  minRole?: 'super_admin' | 'admin' | 'trainer' | 'learner';
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentModule, 
  onSelectModule,
  isMobileOpen,
  onCloseMobile
}) => {
  const { role, isSuperAdmin } = useAuth();

  const sections: { title: string; items: NavItem[] }[] = [
    {
      title: 'Dashboards',
      items: [
        { id: 'super_admin_dashboard', label: 'Super Admin HQ', icon: ShieldAlert, minRole: 'super_admin', badge: 'Root', badgeColor: 'bg-rose-500/20 text-rose-300' },
        { id: 'admin_dashboard', label: 'Admin Overview', icon: LayoutDashboard, minRole: 'admin' },
        { id: 'trainer_dashboard', label: 'Trainer Portal', icon: GraduationCap, minRole: 'trainer' },
        { id: 'learner_dashboard', label: 'Learner Workspace', icon: LayoutDashboard, minRole: 'learner' },
      ]
    },
    {
      title: 'Academy & Curriculum',
      items: [
        { id: 'courses', label: 'Course Catalog', icon: BookOpen },
        { id: 'trainings', label: 'Training Cohorts', icon: Calendar },
        { id: 'resources', label: 'Resource Library', icon: FileText },
        { id: 'assessments', label: 'Assessments & Tests', icon: ClipboardCheck },
        { id: 'progress', label: 'Learner Progress', icon: TrendingUp },
        { id: 'competencies', label: 'Competency Framework', icon: Award },
      ]
    },
    {
      title: 'AI & Collaboration',
      items: [
        { id: 'ai_assistant', label: 'AI Learning Tutor', icon: Sparkles, badge: 'Gemini', badgeColor: 'bg-purple-500/20 text-purple-300' },
        { id: 'notifications', label: 'Notification Center', icon: Bell },
      ]
    },
    {
      title: 'Enterprise Governance',
      items: [
        { id: 'rbac', label: 'RBAC Access Control', icon: Lock, minRole: 'admin' },
        { id: 'users', label: 'User Directory', icon: Users, minRole: 'admin' },
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, minRole: 'trainer' },
        { id: 'audit_logs', label: 'Immutable Audit Trail', icon: History, minRole: 'admin' },
        { id: 'system_settings', label: 'System Settings', icon: Settings, minRole: 'super_admin', badge: 'Gov', badgeColor: 'bg-amber-500/20 text-amber-300' },
        { id: 'profile', label: 'My Profile', icon: UserCheck },
      ]
    }
  ];

  const canAccess = (minRole?: string) => {
    if (!minRole) return true;
    if (isSuperAdmin || role === 'super_admin') return true;
    if (minRole === 'super_admin') return false;
    if (minRole === 'admin') return role === 'admin';
    if (minRole === 'trainer') return role === 'trainer' || role === 'admin';
    return true;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 md:hidden animate-in fade-in"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 h-full md:h-[calc(100vh-4rem)] overflow-y-auto transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 pt-16 md:pt-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6">
          {sections.map((section, idx) => {
            const visibleItems = section.items.filter(item => canAccess(item.minRole));
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx}>
                <div className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {section.title}
                </div>
                <div className="space-y-1">
                  {visibleItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentModule === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectModule(item.id);
                          if (onCloseMobile) onCloseMobile();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tight shrink-0 ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-auto p-4 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Core Architecture v1.0.0</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Role-protected enterprise sandbox
          </div>
        </div>
      </aside>
    </>
  );
};
