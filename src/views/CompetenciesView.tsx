import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Competency, LearnerCompetencyStatus, UserProfile, CompetencyLevel } from '../types';
import { 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  ChevronRight,
  TrendingUp,
  Filter,
  Plus,
  Trash2,
  Edit3,
  Search,
  X,
  Check,
  AlertCircle
} from 'lucide-react';

export const CompetenciesView: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [learnerStatuses, setLearnerStatuses] = useState<LearnerCompetencyStatus[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedLearnerId, setSelectedLearnerId] = useState<string>('');
  const [validating, setValidating] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State for Admin Creating/Editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompetency, setEditingCompetency] = useState<Competency | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Cloud Engineering',
    description: ''
  });

  const [formLevels, setFormLevels] = useState<CompetencyLevel[]>([
    { level: 1, name: 'Novice', description: 'Understands basic vocabulary and foundational concepts.', criteria: ['Basic knowledge'] },
    { level: 2, name: 'Practitioner', description: 'Executes standard tasks and common operational workflows under supervision.', criteria: ['Standard workflows'] },
    { level: 3, name: 'Proficient', description: 'Autonomously builds, deploys, and troubleshoots complex domain workloads.', criteria: ['Autonomous delivery'] },
    { level: 4, name: 'Expert', description: 'Leads architecture patterns, benchmarks performance, and coaches team peers.', criteria: ['Architecture leadership'] },
    { level: 5, name: 'Master / Strategist', description: 'Shapes enterprise roadmap, sets governance policy, and drives research innovation.', criteria: ['Organizational strategy'] }
  ]);

  const canValidate = hasRole(['trainer', 'admin', 'super_admin']);
  const canManage = hasRole(['admin', 'super_admin']);

  const loadData = async () => {
    try {
      const headers = { 'x-user-email': user?.email || '' };
      const [cRes, sRes] = await Promise.all([
        fetch('/api/competencies'),
        fetch(`/api/competencies/learner${selectedLearnerId ? `?userId=${selectedLearnerId}` : ''}`, { headers })
      ]);

      if (cRes.ok) setCompetencies((await cRes.json()).competencies || []);
      if (sRes.ok) setLearnerStatuses((await sRes.json()).statuses || []);

      if (canValidate && users.length === 0) {
        const uRes = await fetch('/api/auth/users', { headers });
        if (uRes.ok) {
          const u = await uRes.json();
          setUsers((u.users || []).filter((usr: UserProfile) => usr.role === 'learner'));
        }
      }
    } catch (e) {
      console.error('Failed to load competencies:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, selectedLearnerId]);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleVerifyLevel = async (competencyId: string, level: number) => {
    const targetUserId = selectedLearnerId || user?.id;
    if (!targetUserId) return;

    setValidating(true);
    try {
      const res = await fetch('/api/competencies/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({
          userId: targetUserId,
          competencyId,
          level
        })
      });
      if (res.ok) {
        showAlert('success', `Competency level ${level} endorsed successfully!`);
        loadData();
      } else {
        const d = await res.json();
        showAlert('error', d.error || 'Failed to endorse competency level');
      }
    } catch (e: any) {
      showAlert('error', e.message || 'Verification error');
    } finally {
      setValidating(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingCompetency(null);
    setFormData({
      code: `COMP-${Date.now().toString().slice(-4)}`,
      name: '',
      category: 'Cloud Engineering',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (comp: Competency) => {
    setEditingCompetency(comp);
    setFormData({
      code: comp.code,
      name: comp.name,
      category: comp.category,
      description: comp.description
    });
    if (comp.levels && comp.levels.length === 5) {
      setFormLevels(comp.levels.map(l => ({ ...l })));
    }
    setIsModalOpen(true);
  };

  const handleSaveCompetency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      showAlert('error', 'Name and Code are required');
      return;
    }

    try {
      const url = editingCompetency ? `/api/competencies/${editingCompetency.id}` : '/api/competencies';
      const method = editingCompetency ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({
          ...formData,
          levels: formLevels
        })
      });

      const d = await res.json();
      if (res.ok) {
        showAlert('success', editingCompetency ? 'Competency updated successfully' : 'Competency created successfully');
        setIsModalOpen(false);
        loadData();
      } else {
        showAlert('error', d.error || 'Failed to save competency');
      }
    } catch (e: any) {
      showAlert('error', e.message || 'Operation failed');
    }
  };

  const handleDeleteCompetency = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete competency "${name}"?`)) return;

    try {
      const res = await fetch(`/api/competencies/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-email': user?.email || '' }
      });

      if (res.ok) {
        showAlert('success', `Competency "${name}" deleted`);
        loadData();
      } else {
        const d = await res.json();
        showAlert('error', d.error || 'Failed to delete competency');
      }
    } catch (e: any) {
      showAlert('error', e.message || 'Delete operation failed');
    }
  };

  const categories = useMemo(() => {
    const set = new Set(competencies.map(c => c.category));
    return ['All', ...Array.from(set)];
  }, [competencies]);

  const filteredCompetencies = useMemo(() => {
    return competencies.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [competencies, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {alert && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg transition-all ${
          alert.type === 'success' ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-300' : 'bg-rose-950/80 border border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {alert.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{alert.message}</span>
          </div>
          <button onClick={() => setAlert(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Award className="w-7 h-7 text-emerald-400" />
            Competency Framework & Skill Matrix
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Standardized enterprise competency levels (Level 1: Novice to Level 5: Strategic Expert) with verified trainer endorsements.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Trainer Selector for which learner to validate */}
          {canValidate && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs">
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400 font-medium">Target Learner:</span>
              <select
                value={selectedLearnerId}
                onChange={(e) => setSelectedLearnerId(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-500"
              >
                <option value="">Myself ({user?.name})</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
          )}

          {canManage && (
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Competency</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search competencies, codes, or skills..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Competencies List */}
      <div className="space-y-6">
        {filteredCompetencies.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <Award className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Competencies Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No competency definitions match your search and category filter.
            </p>
          </div>
        ) : (
          filteredCompetencies.map(comp => {
            const status = learnerStatuses.find(s => s.competencyId === comp.id);
            const currentLvl = status?.currentLevel || 1;

            return (
              <div key={comp.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg relative group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                        {comp.code}
                      </span>
                      <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                        {comp.category}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1.5">{comp.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{comp.description}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
                      <div className="text-xs font-bold text-emerald-400">Level {currentLvl} / 5</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {status?.verifiedBy ? `Verified by ${status.verifiedBy}` : 'Self-assessment'}
                      </div>
                    </div>

                    {canManage && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(comp)}
                          title="Edit Competency"
                          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCompetency(comp.id, comp.name)}
                          title="Delete Competency"
                          className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5-Level Rubric Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
                  {(comp.levels || []).map(lvl => {
                    const isAchieved = lvl.level <= currentLvl;
                    const isCurrent = lvl.level === currentLvl;

                    return (
                      <div
                        key={lvl.level}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                          isCurrent
                            ? 'bg-emerald-500/15 border-emerald-500 text-emerald-100 shadow-md shadow-emerald-950/40'
                            : isAchieved
                            ? 'bg-slate-950 border-slate-700/80 text-slate-200'
                            : 'bg-slate-950/50 border-slate-800/60 text-slate-500 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs font-bold mb-1">
                            <span className={isCurrent ? 'text-emerald-300' : 'text-slate-300'}>Level {lvl.level}</span>
                            {isAchieved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          </div>
                          <div className="text-xs font-semibold text-slate-200 mt-1">{lvl.name}</div>
                          <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{lvl.description}</p>
                        </div>

                        {canValidate && (
                          <div className="pt-3 mt-3 border-t border-slate-800/80">
                            <button
                              disabled={validating}
                              onClick={() => handleVerifyLevel(comp.id, lvl.level)}
                              className={`w-full py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                lvl.level === currentLvl
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              }`}
                            >
                              {lvl.level === currentLvl ? 'Endorsed Level' : 'Endorse Level'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Competency Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingCompetency ? 'Edit Competency' : 'Add New Competency'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCompetency} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Competency Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. COMP-SEC-01"
                    value={formData.code}
                    onChange={e => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cloud Engineering"
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Competency Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zero-Trust Security Architecture"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the skills and criteria evaluated by this competency..."
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingCompetency ? 'Update Competency' : 'Create Competency'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
