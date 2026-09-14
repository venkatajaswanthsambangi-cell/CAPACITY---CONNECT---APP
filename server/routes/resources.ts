import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireRole } from '../middleware/auth';
import { LearningResource } from '../../src/types';

const router = Router();

// GET /api/resources
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const { category, search } = req.query;
  let resources = db.getResources();

  if (category && category !== 'All') {
    resources = resources.filter(r => r.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (search) {
    const q = (search as string).toLowerCase();
    resources = resources.filter(r => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q)));
  }

  res.json({ resources });
});

// POST /api/resources
router.post('/', requireRole(['super_admin', 'admin', 'trainer']), (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user!;
  const body = req.body;

  if (!body.title || !body.url) {
    return res.status(400).json({ error: 'Title and URL are required' });
  }

  const newResource: LearningResource = {
    id: `res_${Date.now()}`,
    title: body.title,
    category: body.category || 'Guide',
    description: body.description || '',
    url: body.url,
    fileSize: body.fileSize || 'Online Resource',
    tags: Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(',').map((t: string) => t.trim()) : ['Enterprise']),
    authorName: actor.name,
    downloadCount: 0,
    createdAt: new Date().toISOString()
  };

  const created = db.createResource(newResource, actor);
  res.status(201).json({ resource: created });
});

export default router;
