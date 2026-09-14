import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { NotificationItem, UserProfile } from '../types';
import { 
  Bell, 
  Send, 
  CheckCircle2, 
  Info, 
  AlertTriangle, 
  AlertOctagon,
  CheckCheck,
  Plus,
  Trash2,
  Filter,
  X,
  UserCheck,
  Check
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'global' | 'alerts'>('all');
  const [loading, setLoading] = useState(true);

  // Toast feedback
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New broadcast form
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'success' | 'warning' | 'alert'>('info');
  const [targetUserId, setTargetUserId] = useState<string>(''); // empty = global broadcast

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, message: msg });
    setTimeout(() => setToast(null), 4000);
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications', {
        headers: { 'x-user-email': user?.email || '' }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }

      if (canBroadcast && users.length === 0) {
        const uRes = await fetch('/api/auth/users', {
          headers: { 'x-user-email': user?.email || '' }
        });
        if (uRes.ok) {
          const u = await uRes.json();
          setUsers(u.users || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/read/${id}`, {
        method: 'POST',
        headers: { 'x-user-email': user?.email || '' }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        showToast('success', 'Notification marked as read');
      }
    } catch (e) {
      showToast('error', 'Failed to update notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'x-user-email': user?.email || '' }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        showToast('success', 'All notifications marked as read');
      }
    } catch (e) {
      showToast('error', 'Failed to mark all as read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-email': user?.email || '' }
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        showToast('success', 'Notification deleted');
      } else {
        const d = await res.json();
        showToast('error', d.error || 'Failed to delete notification');
      }
    } catch (e) {
      showToast('error', 'Failed to delete notification');
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('error', 'Title and message are required');
      return;
    }

    try {
      const res = await fetch('/api/notifications/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({ 
          title: title.trim(), 
          message: message.trim(), 
          type,
          userId: targetUserId || undefined
        })
      });
      if (res.ok) {
        setShowBroadcastModal(false);
        setTitle('');
        setMessage('');
        setTargetUserId('');
        showToast('success', 'Notification broadcast dispatched');
        loadNotifications();
      } else {
        const d = await res.json();
        showToast('error', d.error || 'Failed to broadcast');
      }
    } catch (e) {
      showToast('error', 'Broadcast error');
    }
  };

  const canBroadcast = hasRole(['trainer', 'admin', 'super_admin']);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (filterTab === 'unread') return !n.isRead;
      if (filterTab === 'global') return n.isGlobal;
      if (filterTab === 'alerts') return n.type === 'alert' || n.type === 'warning';
      return true;
    });
  }, [notifications, filterTab]);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg transition-all ${
          toast.type === 'success' ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-300' : 'bg-rose-950/80 border border-rose-500/30 text-rose-300'
        }`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-emerald-400" />
            Notifications & Announcement Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System announcements, cohort alerts, assessment deadlines, and governance alerts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Mark All Read</span>
            </button>
          )}

          {canBroadcast && (
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Dispatch Alert</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterTab === 'all'
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All ({notifications.length})
        </button>

        <button
          onClick={() => setFilterTab('unread')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            filterTab === 'unread'
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setFilterTab('global')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterTab === 'global'
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Institutional Broadcasts
        </button>

        <button
          onClick={() => setFilterTab('alerts')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterTab === 'alerts'
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          High Priority Alerts
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs bg-slate-900 border border-slate-800 rounded-2xl">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No notifications</h3>
            <p className="text-xs text-slate-400 mt-1">You are all caught up on system notices and alerts.</p>
          </div>
        ) : (
          filteredNotifications.map(n => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                n.isRead
                  ? 'bg-slate-900/60 border-slate-800/60 opacity-75'
                  : 'bg-slate-900 border-emerald-500/30 shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  n.type === 'alert' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  n.type === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  n.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {n.type === 'alert' ? <AlertOctagon className="w-4 h-4" /> :
                   n.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                   n.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                   <Info className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{n.title}</span>
                    {n.isGlobal ? (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded font-medium">
                        Global Broadcast
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-medium">
                        Direct
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-500 mt-2 block font-mono">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Read</span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(n.id)}
                  title="Delete notification"
                  className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" />
                Dispatch Broadcast Notification
              </h3>
              <button onClick={() => setShowBroadcastModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Audience *</label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Broadcast to All Users (Global)</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role} - {u.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Alert Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule Update for Enterprise Cloud Cohort"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Severity / Classification</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="info">General Information</option>
                  <option value="success">Success / Milestone</option>
                  <option value="warning">Schedule Notice</option>
                  <option value="alert">Critical Security Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Message Content *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide complete instructions or notification text..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast Alert</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
