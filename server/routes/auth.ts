import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireAuth, requireSuperAdmin, requireRole } from '../middleware/auth';
import { UserProfile, UserRole } from '../../src/types';

const router = Router();

// GET /api/auth/me
router.get('/me', (req: AuthenticatedRequest, res: Response) => {
  const settings = db.getSystemSettings();
  const superAdminEmail = settings.superAdminEmail.toLowerCase().trim();

  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: No active session', isAuthenticated: false });
  }

  const isConfiguredSuperAdmin = user.email.toLowerCase().trim() === superAdminEmail;
  if (isConfiguredSuperAdmin && user.role !== 'super_admin') {
    user.role = 'super_admin';
    db.setUserRole(user.id, 'super_admin', user);
  }

  res.json({
    user,
    isSuperAdmin: user.role === 'super_admin' || isConfiguredSuperAdmin,
    configuredSuperAdminEmail: settings.superAdminEmail
  });
});

// POST /api/auth/register
router.post('/register', (req: AuthenticatedRequest, res: Response) => {
  const { name, email, department, title } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Full name and email are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const normalized = (email as string).toLowerCase().trim();
  const settings = db.getSystemSettings();
  const superAdminEmail = settings.superAdminEmail.toLowerCase().trim();

  const existing = db.getUsers().find(u => u.email.toLowerCase().trim() === normalized);
  if (existing) {
    return res.status(409).json({ error: 'An account with this enterprise email already exists.' });
  }

  if (!settings.allowSelfRegistration && normalized !== superAdminEmail) {
    return res.status(403).json({ error: 'Self-registration is currently disabled by enterprise policy.' });
  }

  const role: UserRole = normalized === superAdminEmail ? 'super_admin' : (settings.defaultUserRole || 'learner');

  const newUser = db.upsertUser({
    id: `usr_${Date.now()}`,
    email: normalized,
    name: (name as string).trim(),
    role,
    department: (department as string)?.trim() || 'General Operations',
    title: (title as string)?.trim() || 'Capacity Associate',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  });

  db.addAuditLog({
    actorId: newUser.id,
    actorEmail: newUser.email,
    actorRole: newUser.role,
    action: 'USER_REGISTER',
    module: 'Authentication',
    details: `User ${newUser.name} (${newUser.email}) registered with role ${newUser.role}`,
    status: 'SUCCESS'
  });

  res.status(201).json({ user: newUser, message: 'Registration successful' });
});

// POST /api/auth/login
router.post('/login', (req: AuthenticatedRequest, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const normalized = (email as string).toLowerCase().trim();
  const settings = db.getSystemSettings();
  const superAdminEmail = settings.superAdminEmail.toLowerCase().trim();

  let user = db.getUsers().find(u => u.email.toLowerCase().trim() === normalized);

  if (!user) {
    if (normalized === superAdminEmail) {
      // Auto bootstrap Super Admin account
      user = db.upsertUser({
        id: `usr_${Date.now()}`,
        email: normalized,
        name: 'Venkata Jaswanth Sambangi',
        role: 'super_admin',
        department: 'Executive Governance',
        title: 'Super Administrator',
        bio: 'Bootstrap configured Super Administrator.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      });
    } else if (settings.allowSelfRegistration) {
      user = db.upsertUser({
        id: `usr_${Date.now()}`,
        email: normalized,
        name: normalized.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        role: settings.defaultUserRole,
        department: 'General Operations',
        title: 'Capacity Learner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      });
    } else {
      return res.status(403).json({ error: 'User not registered and self-registration is closed.' });
    }
  }

  db.addAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: 'USER_LOGIN',
    module: 'Authentication',
    details: `User ${user.email} signed in with role ${user.role}`,
    status: 'SUCCESS'
  });

  res.json({ user, message: 'Authentication successful' });
});

// POST /api/auth/session (alias for login)
router.post('/session', (req: AuthenticatedRequest, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const normalized = (email as string).toLowerCase().trim();
  const settings = db.getSystemSettings();
  const superAdminEmail = settings.superAdminEmail.toLowerCase().trim();

  let user = db.getUsers().find(u => u.email.toLowerCase().trim() === normalized);

  if (!user) {
    if (normalized === superAdminEmail) {
      user = db.upsertUser({
        id: `usr_${Date.now()}`,
        email: normalized,
        name: 'Venkata Jaswanth Sambangi',
        role: 'super_admin',
        department: 'Executive Governance',
        title: 'Super Administrator',
        bio: 'Bootstrap configured Super Administrator.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      });
    } else if (settings.allowSelfRegistration) {
      user = db.upsertUser({
        id: `usr_${Date.now()}`,
        email: normalized,
        name: normalized.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        role: settings.defaultUserRole,
        department: 'General Operations',
        title: 'Capacity Learner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      });
    } else {
      return res.status(403).json({ error: 'User not registered and self-registration is closed.' });
    }
  }

  res.json({ user, message: 'Session verified' });
});

// POST /api/auth/switch-demo
// Fast role switcher for instant verification of all 4 roles in evaluation
router.post('/switch-demo', (req: AuthenticatedRequest, res: Response) => {
  const { role } = req.body as { role: UserRole };
  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  const user = db.getUsers().find(u => u.role === role);
  if (!user) {
    return res.status(404).json({ error: `Demo account for role ${role} not found` });
  }

  res.json({ user, message: `Switched demo context to ${user.name} (${user.role})` });
});

// GET /api/auth/users (Admin / Super Admin only)
router.get('/users', requireRole(['super_admin', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const users = db.getUsers();
  res.json({ users });
});

// PUT /api/auth/users/:id/role (Super Admin only)
router.put('/users/:id/role', requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const { role } = req.body as { role: UserRole };
  
  if (!['super_admin', 'admin', 'trainer', 'learner'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const actor = req.user!;
  const updatedUser = db.setUserRole(id, role, actor);
  res.json({ user: updatedUser, message: `Role updated to ${role}` });
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const { name, department, title, bio, phoneNumber } = req.body;

  const updated = db.upsertUser({
    ...actor,
    name: name || actor.name,
    department: department || actor.department,
    title: title || actor.title,
    bio: bio || actor.bio,
    phoneNumber: phoneNumber || actor.phoneNumber,
    updatedAt: new Date().toISOString()
  });

  res.json({ user: updated, message: 'Profile updated successfully' });
});

export default router;
