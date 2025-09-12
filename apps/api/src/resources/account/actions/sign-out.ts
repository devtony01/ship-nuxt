import { Router } from 'express';

import { authService } from 'services';

import { AppMiddleware, AppRequest, AppResponse } from 'types';

const handler: AppMiddleware = async (req: AppRequest, res: AppResponse) => {
  await authService.unsetUserAccessToken({ req, res });

  res.status(204).send();
};
export default (router: Router) => {
  router.post('/sign-out', handler);
};
