import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Views
import { SuperAdminDashboard } from './views/SuperAdminDashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { TrainerDashboard } from './views/TrainerDashboard';
import { LearnerDashboard } from './views/LearnerDashboard';
import { CoursesView } from './views/CoursesView';
import { TrainingsView } from './views/TrainingsView';
import { ResourcesView } from './views/ResourcesView';
import { AssessmentsView } from './views/AssessmentsView';
import { ProgressView } from './views/ProgressView';
import { CompetenciesView } from './views/CompetenciesView';
import { NotificationsView } from './views/NotificationsView';
import { AiAssistantView } from './views/AiAssistantView';
import { ReportsView } from './views/ReportsView';
import { AuditLogsView } from './views/AuditLogsView';
import { SystemSettingsView } from './views/SystemSettingsView';
import { RbacView } from './views/RbacView';
import { ProfileView } from './views/ProfileView';
import { UserDirectoryView } from './views/UserDirectoryView';
import { AuthView } from './views/AuthView';
import { ShieldAlert, Lock } from 'lucide-react';

export const App: React.FC = () => {
  const { user, role, isSuperAdmin, loading, hasRole } = useAuth();
  const [currentModule, setCurrentModule] = useState<string>('learner_dashboard');
  const [aiContextCourseId, setAiContextCourseId] = useState<string>('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Initializing CAPACITY CONNECT Enterprise...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthView onSuccess={() => setCurrentModule('learner_dashboard')} />;
  }

  const handleAskAiAboutCourse = (courseId: string) => {
    setAiContextCourseId(courseId);
    setCurrentModule('ai_assistant');
  };

  const renderCurrentModule = () => {
    switch (currentModule) {
      // Dashboards
      case 'super_admin_dashboard':
        if (!isSuperAdmin && role !== 'super_admin') {
          return <AccessRestricted requiredRole="Super Administrator" />;
        }
        return <SuperAdminDashboard />;

      case 'admin_dashboard':
        if (!hasRole(['admin', 'super_admin'])) {
          return <AccessRestricted requiredRole="Administrator" />;
        }
        return <AdminDashboard onNavigate={setCurrentModule} />;

      case 'trainer_dashboard':
        if (!hasRole(['trainer', 'admin', 'super_admin'])) {
          return <AccessRestricted requiredRole="Trainer" />;
        }
        return <TrainerDashboard onNavigate={setCurrentModule} />;

      case 'learner_dashboard':
        return <LearnerDashboard onNavigate={setCurrentModule} />;

      // Academy & Curriculum
      case 'courses':
        return <CoursesView onAskAi={handleAskAiAboutCourse} />;

      case 'trainings':
        return <TrainingsView />;

      case 'resources':
        return <ResourcesView />;

      case 'assessments':
        return <AssessmentsView />;

      case 'progress':
        return <ProgressView />;

      case 'competencies':
        return <CompetenciesView />;

      // AI & Intelligence
      case 'ai_assistant':
        return <AiAssistantView initialCourseId={aiContextCourseId} />;

      case 'notifications':
        return <NotificationsView />;

      // Governance
      case 'reports':
        if (!hasRole(['trainer', 'admin', 'super_admin'])) {
          return <AccessRestricted requiredRole="Trainer or Administrator" />;
        }
        return <ReportsView />;

      case 'audit_logs':
        if (!hasRole(['admin', 'super_admin'])) {
          return <AccessRestricted requiredRole="Administrator" />;
        }
        return <AuditLogsView />;

      case 'system_settings':
        if (!isSuperAdmin && role !== 'super_admin') {
          return <AccessRestricted requiredRole="Super Administrator" />;
        }
        return <SystemSettingsView />;

      case 'rbac':
        return <RbacView />;

      case 'users':
        if (!hasRole(['admin', 'super_admin'])) {
          return <AccessRestricted requiredRole="Administrator" />;
        }
        return <UserDirectoryView />;

      case 'profile':
        return <ProfileView />;

      default:
        return <LearnerDashboard onNavigate={setCurrentModule} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar 
        currentModule={currentModule} 
        onSelectModule={(mod) => {
          setCurrentModule(mod);
          setMobileSidebarOpen(false);
        }}
        isMobileOpen={mobileSidebarOpen}
        onToggleMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar 
          currentModule={currentModule} 
          onSelectModule={(mod) => {
            setCurrentModule(mod);
            setMobileSidebarOpen(false);
          }}
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 bg-slate-950/60 w-full">
          <div className="max-w-7xl mx-auto">
            {renderCurrentModule()}
          </div>
        </main>
      </div>
    </div>
  );
};

const AccessRestricted: React.FC<{ requiredRole: string }> = ({ requiredRole }) => (
  <div className="p-12 text-center bg-slate-900 border border-rose-500/30 rounded-3xl space-y-4 max-w-lg mx-auto mt-12">
    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
      <Lock className="w-6 h-6" />
    </div>
    <h2 className="text-lg font-bold text-white">Access Restricted by Role Governance</h2>
    <p className="text-xs text-slate-400 leading-relaxed">
      This module strictly requires <strong className="text-rose-400">{requiredRole}</strong> privileges.
      Switch roles in the top navbar to verify role-based permissions or request elevation from the Super Administrator.
    </p>
  </div>
);
