import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireSuperAdmin } from '../middleware/auth';

const router = Router();

// GET /api/settings
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const settings = db.getSystemSettings();
  res.json({ settings });
});

// PUT /api/settings (Super Admin strictly required)
router.put('/', requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const body = req.body;

  if (body.superAdminEmail && typeof body.superAdminEmail === 'string') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.superAdminEmail)) {
      return res.status(400).json({ error: 'Invalid superAdminEmail format' });
    }
  }

  if (body.auditRetentionDays !== undefined) {
    const days = Number(body.auditRetentionDays);
    if (isNaN(days) || days < 1) {
      return res.status(400).json({ error: 'auditRetentionDays must be a positive number' });
    }
  }

  try {
    const updated = db.updateSystemSettings(body, actor);
    res.json({ settings: updated, message: 'System settings saved successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/settings/reset (Super Admin strictly required)
router.post('/reset', requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  try {
    const defaultSettings = {
      superAdminEmail: 'venkatajaswanthsambangi@gmail.com',
      organizationName: 'CAPACITY CONNECT Enterprise',
      defaultUserRole: 'learner' as const,
      allowSelfRegistration: true,
      aiModel: 'gemini-3.5-flash',
      auditRetentionDays: 90,
      enforceRbacStrict: true,
      supportContactEmail: 'support@capacityconnect.org',
      maintenanceMode: false,
      aiAssistantEnabled: true
    };
    const updated = db.updateSystemSettings(defaultSettings, actor);
    res.json({ settings: updated, message: 'System settings reset to enterprise defaults' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
