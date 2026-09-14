import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  ShieldCheck, 
  Crown, 
  ArrowRight, 
  Mail, 
  User, 
  Briefcase, 
  CheckCircle2,
  Sparkles,
  UserPlus,
  LogIn
} from 'lucide-react';

interface AuthViewProps {
  onSuccess: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  
  // Sign-in state
  const [email, setEmail] = useState('');
  
  // Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState('Digital Transformation');
  const [regTitle, setRegTitle] = useState('Systems Analyst');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');
    try {
      await login(email.trim());
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setError('Name and enterprise email are required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await register({
        name: regName.trim(),
        email: regEmail.trim(),
        department: regDepartment.trim(),
        title: regTitle.trim()
      });
      setSuccessMsg('Account registered successfully! Redirecting...');
      setTimeout(() => {
        onSuccess();
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (targetEmail: string) => {
    setEmail(targetEmail);
    setLoading(true);
    setError('');
    try {
      await login(targetEmail);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -top-40 -left-40 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl -bottom-40 -right-40 pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">CAPACITY CONNECT</h1>
          <p className="text-xs text-slate-400">Institutional Capacity Building & Governance Architecture</p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(''); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'signin'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'register'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Register Personnel
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 animate-in fade-in">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {mode === 'signin' ? (
          /* Email Sign-in form */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Enterprise Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@enterprise.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/40"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In with Secure Session'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Register new user form */
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Maya Lin"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Enterprise Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@enterprise.org"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. DevOps"
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Engineer"
                  value={regTitle}
                  onChange={(e) => setRegTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !regName.trim() || !regEmail.trim()}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/40 mt-2"
            >
              <span>{loading ? 'Registering Account...' : 'Complete Self-Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Quick Role Selectors for Immediate Evaluation */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
            One-Click Verified Demo Accounts
          </div>

          {/* Super Admin primary */}
          <button
            onClick={() => handleQuickLogin('venkatajaswanthsambangi@gmail.com')}
            className="w-full p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-left flex items-center justify-between transition-colors"
          >
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                <Crown className="w-3.5 h-3.5 text-rose-400" />
                Super Admin Access
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                venkatajaswanthsambangi@gmail.com
              </div>
            </div>
            <span className="text-[10px] font-semibold text-rose-300 uppercase tracking-tight">Root</span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('admin@capacityconnect.org')}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-center transition-colors"
            >
              <div className="text-[11px] font-bold text-amber-400">Admin</div>
              <div className="text-[9px] text-slate-500 mt-0.5 truncate">Elena Rostova</div>
            </button>

            <button
              onClick={() => handleQuickLogin('trainer@capacityconnect.org')}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-center transition-colors"
            >
              <div className="text-[11px] font-bold text-emerald-400">Trainer</div>
              <div className="text-[9px] text-slate-500 mt-0.5 truncate">Dr. Vance</div>
            </button>

            <button
              onClick={() => handleQuickLogin('learner@capacityconnect.org')}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-center transition-colors"
            >
              <div className="text-[11px] font-bold text-blue-400">Learner</div>
              <div className="text-[9px] text-slate-500 mt-0.5 truncate">Aria Chen</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
