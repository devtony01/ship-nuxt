import { eq } from '@paracelsus/node-sql';
import { users } from '@ship-nuxt/entities';
import { Router } from 'express';

import { userService } from 'resources/user';

import { AppMiddleware, AppRequest, AppResponse } from 'types';

const validator: AppMiddleware = async (req: AppRequest, res: AppResponse, next) => {
  const { id } = req.params;

  const isUserExists = await userService.exists(eq(users.id, Number.parseInt(id, 10)));

  res.assertError(isUserExists, 'User not found');

  next();
};

const handler: AppMiddleware = async (req: AppRequest, res: AppResponse) => {
  const { id } = req.params;

  await userService.deleteSoft(eq(users.id, Number.parseInt(id, 10)));

  res.status(204).send();
};

export default (router: Router) => {
  router.delete('/:id', validator, handler);
};