import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/audit-logs (Admin, Super Admin only)
router.get('/', requireRole(['super_admin', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const { module, actor, status, search } = req.query;
  let logs = db.getAuditLogs();

  if (module && module !== 'All') {
    logs = logs.filter(l => l.module.toLowerCase() === (module as string).toLowerCase());
  }

  if (status && status !== 'All') {
    logs = logs.filter(l => l.status.toLowerCase() === (status as string).toLowerCase());
  }

  if (actor) {
    const q = (actor as string).toLowerCase();
    logs = logs.filter(l => l.actorEmail.toLowerCase().includes(q));
  }

  if (search) {
    const q = (search as string).toLowerCase();
    logs = logs.filter(l => 
      l.details.toLowerCase().includes(q) || 
      l.action.toLowerCase().includes(q) || 
      l.module.toLowerCase().includes(q)
    );
  }

  res.json({ logs });
});

// GET /api/audit-logs/export (Admin, Super Admin)
router.get('/export', requireRole(['super_admin', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const logs = db.getAuditLogs();
  res.json({
    exportedAt: new Date().toISOString(),
    totalRecords: logs.length,
    logs
  });
});

// GET /api/audit-logs/:id (Admin, Super Admin)
router.get('/:id', requireRole(['super_admin', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const log = db.getAuditLogs().find(l => l.id === req.params.id);
  if (!log) {
    return res.status(404).json({ error: 'Audit log record not found' });
  }
  res.json({ log });
});

// POST /api/audit-logs (Admin, Super Admin - for explicit compliance event flagging)
router.post('/', requireRole(['super_admin', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const { action, module, details, status } = req.body;

  if (!action || !module || !details) {
    return res.status(400).json({ error: 'Action, module, and details are required' });
  }

  const log = db.addAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    action: String(action).toUpperCase(),
    module: String(module),
    details: String(details),
    status: status || 'SUCCESS'
  });

  res.status(201).json({ log });
});

export default router;
