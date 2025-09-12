import cookieParser from 'cookie-parser';
import { Express } from 'express';

import { AppRequest, AppResponse } from 'types';

import adminRoutes from './admin.routes';
import privateRoutes from './private.routes';
import publicRoutes from './public.routes';

export default (app: Express) => {
  // Add cookie parser middleware
  app.use(cookieParser());

  app.get('/health', (req: AppRequest, res: AppResponse) => {
    res.json({ status: 'OK' });
  });

  // Mount API routes
  app.use('/api', publicRoutes);
  app.use('/api/private', privateRoutes);
  app.use('/api/admin', adminRoutes);
};