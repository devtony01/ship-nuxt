import { Router } from 'express';
import process from 'node:process';

import { AppRequest, AppResponse } from 'types';

const router: Router = Router();

router.get('/health', (req: AppRequest, res: AppResponse) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

export default router;
