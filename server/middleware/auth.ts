import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { UserProfile, UserRole } from '../../src/types';

export interface AuthenticatedRequest extends Request {
  user?: UserProfile;
}

export const authenticateUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const customUserId = req.headers['x-user-id'] as string | undefined;
    const customUserEmail = req.headers['x-user-email'] as string | undefined;

    let user: UserProfile | undefined;
    const settings = db.getSystemSettings();
    const superAdminEmail = settings.superAdminEmail.toLowerCase().trim();

    // 1. Check custom user email or ID headers (used by frontend session manager)
    if (customUserEmail) {
      const emailNormalized = customUserEmail.toLowerCase().trim();
      user = db.getUsers().find(u => u.email.toLowerCase().trim() === emailNormalized);
      
      // If user does not exist yet and matches super admin email, create them immediately
      if (!user && emailNormalized === superAdminEmail) {
        user = db.upsertUser({
          id: `usr_${Date.now()}`,
          email: customUserEmail,
          name: 'Venkata Jaswanth Sambangi',
          role: 'super_admin',
          department: 'Executive Governance',
          title: 'Super Administrator',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true
        });
      }
    } else if (customUserId) {
      user = db.getUsers().find(u => u.id === customUserId);
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // If token is an email or token formatted as user ID
      if (token.includes('@')) {
        const emailNormalized = token.toLowerCase().trim();
        user = db.getUsers().find(u => u.email.toLowerCase().trim() === emailNormalized);
      } else {
        user = db.getUsers().find(u => u.id === token);
      }
    }

    // If valid user session was identified, attach to request
    if (user) {
      // Dynamic check: If their email matches superAdminEmail, always ensure super_admin role
      if (user.email.toLowerCase().trim() === superAdminEmail && user.role !== 'super_admin') {
        user.role = 'super_admin';
      }
      req.user = user;
    }

    next();
  } catch (error) {
    console.error('[Auth Middleware] Error authenticating request:', error);
    next();
  }
};

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }
  next();
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    // Super Admin always has full bypass authority across all roles
    if (req.user.role === 'super_admin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Forbidden: Access restricted to roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}` 
      });
    }

    next();
  };
};

export const requireSuperAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }

  const superAdminEmail = db.getSystemSettings().superAdminEmail.toLowerCase().trim();
  const isSuperAdmin = req.user.role === 'super_admin' || req.user.email.toLowerCase().trim() === superAdminEmail;

  if (!isSuperAdmin) {
    return res.status(403).json({ error: 'Forbidden: Super Admin privileges strictly required' });
  }

  next();
};
