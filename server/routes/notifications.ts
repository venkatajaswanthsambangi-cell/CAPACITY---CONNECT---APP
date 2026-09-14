import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/notifications
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const { isRead } = req.query;
  let notifications = db.getNotifications().filter(n => n.isGlobal || n.userId === actor.id);

  if (isRead !== undefined) {
    const boolVal = isRead === 'true';
    notifications = notifications.filter(n => n.isRead === boolVal);
  }

  res.json({ notifications });
});

// GET /api/notifications/unread-count
router.get('/unread-count', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const unread = db.getNotifications().filter(n => (n.isGlobal || n.userId === actor.id) && !n.isRead).length;
  res.json({ unreadCount: unread });
});

// POST /api/notifications/read-all
router.post('/read-all', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const count = db.markAllNotificationsAsRead(actor.id);
  res.json({ count, message: `${count} notifications marked as read` });
});

// POST /api/notifications/read/:id
router.post('/read/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const updated = db.markNotificationAsRead(id);
  if (!updated) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  res.json({ notification: updated });
});

// DELETE /api/notifications/:id
router.delete('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const id = String(req.params.id);
  const notif = db.getNotifications().find(n => n.id === id);

  if (!notif) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  // Only the notification recipient or admin/super_admin can delete
  if (actor.role === 'learner' && notif.userId !== actor.id && !notif.isGlobal) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  db.deleteNotification(id);
  res.json({ success: true, message: 'Notification removed' });
});

// POST /api/notifications/broadcast (Admin, Trainer, Super Admin)
router.post('/broadcast', requireRole(['super_admin', 'admin', 'trainer']), (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const { title, message, type, link, userId } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' });
  }

  const notif = db.addNotification({
    title,
    message,
    type: type || 'info',
    isRead: false,
    isGlobal: !userId,
    userId: userId || undefined,
    link
  });

  db.addAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    action: 'SEND_NOTIFICATION',
    module: 'Notifications',
    details: `Broadcasted notification: "${title}"`,
    status: 'SUCCESS'
  });

  res.status(201).json({ notification: notif });
});

export default router;
