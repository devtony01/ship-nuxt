import { Express } from 'express';

import adminRoutes from './admin.routes';
import privateRoutes from './private.routes';
import publicRoutes from './public.routes';

export default (app: Express) => {
  app.get('/api/health', async (req, res) => {
    try {
      res.json({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Mount API routes
  app.use('/api', publicRoutes);
  app.use('/api/private', privateRoutes);
  app.use('/api/admin', adminRoutes);
};
