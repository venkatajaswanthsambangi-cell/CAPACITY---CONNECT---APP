import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

import { authenticateUser } from './middleware/auth';
import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
import trainingRoutes from './routes/trainings';
import resourceRoutes from './routes/resources';
import assessmentRoutes from './routes/assessments';
import progressRoutes from './routes/progress';
import competencyRoutes from './routes/competencies';
import notificationRoutes from './routes/notifications';
import aiRoutes from './routes/ai';
import reportRoutes from './routes/reports';
import auditRoutes from './routes/audit';
import settingRoutes from './routes/settings';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || process.env.APP_PORT || '3000', 10);
const HOST = '0.0.0.0';

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Authentication parser
app.use(authenticateUser);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'CAPACITY CONNECT Enterprise',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount Core API Modules
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/competencies', competencyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai/assistant', aiRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/settings', settingRoutes);

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const distDir = path.resolve(process.cwd(), 'dist');

  if (isProd && fs.existsSync(distDir)) {
    console.log('[Capacity Connect] Serving production build from dist/');
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    console.log('[Capacity Connect] Launching Vite middleware in development mode...');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0'
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, HOST, () => {
    console.log(`====================================================`);
    console.log(`CAPACITY CONNECT Enterprise Server Active`);
    console.log(`Running at: http://${HOST}:${PORT}`);
    console.log(`Health Check: http://${HOST}:${PORT}/api/health`);
    console.log(`Super Admin Configured: venkatajaswanthsambangi@gmail.com`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('[Capacity Connect] Fatal server startup error:', err);
  process.exit(1);
});
