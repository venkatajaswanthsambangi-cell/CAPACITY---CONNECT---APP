import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuditLog } from '../types';
import { 
  History, 
  Search, 
  Filter, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Download,
  RefreshCw,
  Eye,
  Plus,
  X,
  FileText
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Selected Log Modal for detailed viewing
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Add Compliance Entry Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [complianceAction, setComplianceAction] = useState('COMPLIANCE_VERIFICATION');
  const [complianceModule, setComplianceModule] = useState('Security Governance');
  const [complianceDetails, setComplianceDetails] = useState('');

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (moduleFilter !== 'All') params.append('module', moduleFilter);
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/audit-logs?${params.toString()}`, {
        headers: { 'x-user-email': user?.email || '' }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [user, moduleFilter, statusFilter]);

  const handleExportAudit = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/audit-logs/export', {
        headers: { 'x-user-email': user?.email || '' }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `capacity-connect-audit-trail-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (e) {
      console.error('Audit export failed:', e);
    } finally {
      setExporting(false);
    }
  };

  const handleCreateComplianceEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complianceDetails.trim()) return;

    try {
      const res = await fetch('/api/audit-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({
          action: complianceAction,
          module: complianceModule,
          details: complianceDetails,
          status: 'SUCCESS'
        })
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setComplianceDetails('');
        loadLogs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const modules = [
    'All', 
    'Authentication', 
    'Users', 
    'Courses', 
    'Trainings', 
    'Assessments', 
    'Competencies', 
    'AI Assistant', 
    'Notifications', 
    'Security Governance', 
    'System Settings'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            Immutable Enterprise Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident logs of all role escalations, administrative actions, security configuration changes, and model queries.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            onClick={loadLogs}
            disabled={loading}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {hasRole(['admin', 'super_admin']) && (
            <>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Compliance Event</span>
              </button>

              <button
                disabled={exporting}
                onClick={handleExportAudit}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{exporting ? 'Exporting...' : 'Export Audit JSON'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            {modules.map(m => (
              <option key={m} value={m}>Module: {m}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">Status: All</option>
            <option value="SUCCESS">Status: SUCCESS</option>
            <option value="FAILED">Status: FAILED</option>
          </select>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search action, email, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadLogs()}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/60">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                <th className="py-3.5 px-4 font-semibold">Action</th>
                <th className="py-3.5 px-4 font-semibold">Actor</th>
                <th className="py-3.5 px-4 font-semibold">Module</th>
                <th className="py-3.5 px-4 font-semibold">Details</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No audit records match the current filter query.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr 
                    key={log.id} 
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-mono text-[11px]">{log.actorEmail}</div>
                      <span className="text-[10px] text-slate-500 capitalize">{log.actorRole.replace('_', ' ')}</span>
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-medium whitespace-nowrap">
                      {log.module}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="text-slate-500 hover:text-white p-1">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Audit Event Record</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl space-y-1 font-mono text-[11px]">
                <div className="text-slate-500">Record ID: <span className="text-slate-300">{selectedLog.id}</span></div>
                <div className="text-slate-500">Timestamp: <span className="text-slate-300">{new Date(selectedLog.timestamp).toISOString()}</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl">
                  <div className="text-slate-500 font-medium">Action</div>
                  <div className="text-white font-bold mt-0.5">{selectedLog.action}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl">
                  <div className="text-slate-500 font-medium">Module</div>
                  <div className="text-emerald-400 font-bold mt-0.5">{selectedLog.module}</div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl">
                <div className="text-slate-500 font-medium">Actor Identity</div>
                <div className="text-white font-mono mt-0.5">{selectedLog.actorEmail}</div>
                <div className="text-slate-400 text-[11px] capitalize mt-0.5">Role: {selectedLog.actorRole} • ID: {selectedLog.actorId}</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl">
                <div className="text-slate-500 font-medium mb-1">Details & Audit Payload</div>
                <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{selectedLog.details}</p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                  selectedLog.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  Status: {selectedLog.status}
                </span>

                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Compliance Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Record Compliance Event</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateComplianceEntry} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Action Identifier *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ANNUAL_SECURITY_REVIEW"
                  value={complianceAction}
                  onChange={e => setComplianceAction(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Module / Domain *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Security Governance"
                  value={complianceModule}
                  onChange={e => setComplianceModule(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Compliance Notes & Evidence *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail verification results, auditor names, or regulatory checkpoints..."
                  value={complianceDetails}
                  onChange={e => setComplianceDetails(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow"
                >
                  Commit Audit Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
