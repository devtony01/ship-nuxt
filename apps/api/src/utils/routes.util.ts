import { Router } from 'express';

export type RegisterRouteFunc = (router: Router) => void;

const getRoutes = (routeFunctions: RegisterRouteFunc[]): Router => {
  const router = Router();

  routeFunctions.forEach((func: RegisterRouteFunc) => {
    func(router);
  });

  return router;
};

export default {
  getRoutes,
};