import { Router } from 'express';

import { userService } from 'resources/user';

import { AppMiddleware, AppRequest, AppResponse } from 'types';

const handler: AppMiddleware = async (req: AppRequest, res: AppResponse) => {
  // Auth middleware ensures req.user exists
  const user = req.user!;

  res.json(userService.getPublic(user));
};

export default (router: Router) => {
  router.get('/', handler);
};
