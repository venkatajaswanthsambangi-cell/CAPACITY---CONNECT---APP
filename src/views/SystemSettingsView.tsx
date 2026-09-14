import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SystemSettings } from '../types';
import { 
  Settings, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  Crown, 
  Lock, 
  Database,
  Sliders
} from 'lucide-react';

export const SystemSettingsView: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(d => setSettings(d.settings))
      .catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !user) return;

    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">System Governance & Settings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Core platform identity, Super Admin email whitelisting, and authorization enforcement switches.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Super Admin Authorization Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
            <Crown className="w-4 h-4" />
            Super Administrator Account Whitelist
          </div>
          <p className="text-xs text-slate-400">
            The account configured here has complete administrative authority over CAPACITY CONNECT, including promoting other administrators and adjusting security parameters.
          </p>

          <div className="max-w-xl">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Configured Super Admin Email
            </label>
            <input
              type="email"
              required
              value={settings.superAdminEmail}
              onChange={(e) => setSettings({ ...settings, superAdminEmail: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:border-rose-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Default whitelisted root: <strong className="text-slate-300">venkatajaswanthsambangi@gmail.com</strong>
            </span>
          </div>
        </div>

        {/* Governance Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
          <h2 className="text-base font-bold text-white">Security & Access Configuration</h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
              <div>
                <div className="text-xs font-bold text-white">Enforce Strict Role-Based Access Control (RBAC)</div>
                <div className="text-[11px] text-slate-400">Disallow unauthorized role-bypassing outside of Super Admin.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.enforceRbacStrict}
                onChange={(e) => setSettings({ ...settings, enforceRbacStrict: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded bg-slate-900 border-slate-700 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
              <div>
                <div className="text-xs font-bold text-white">Self-Registration Allowed</div>
                <div className="text-[11px] text-slate-400">Permit external email addresses to sign up automatically as Learners.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.allowSelfRegistration}
                onChange={(e) => setSettings({ ...settings, allowSelfRegistration: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded bg-slate-900 border-slate-700 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
              <div>
                <div className="text-xs font-bold text-white">AI Learning Tutor Enabled</div>
                <div className="text-[11px] text-slate-400">Allow users to consult the Gemini-powered educational assistant.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.aiAssistantEnabled}
                onChange={(e) => setSettings({ ...settings, aiAssistantEnabled: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded bg-slate-900 border-slate-700 focus:ring-emerald-500"
              />
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          {savedSuccess ? (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> System settings persisted successfully!
            </span>
          ) : (
            <span className="text-xs text-slate-400">
              Only authorized Super Administrators can persist system setting updates.
            </span>
          )}

          <button
            type="submit"
            disabled={saving || !isSuperAdmin}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
