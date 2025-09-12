import { eq } from '@paracelsus/node-sql';
import { users } from '@ship-nuxt/entities';
import { updateUserSchema } from '@ship-nuxt/schemas';
import { Router } from 'express';
import _ from 'lodash';

import { userService } from 'resources/user';

import { validateMiddleware } from 'middlewares';

import { AppMiddleware, AppRequest, AppResponse, UpdateUserParams } from 'types';

const validator: AppMiddleware = async (req: AppRequest, res: AppResponse, next) => {
  const { id } = req.params;

  res.assertError(id, 'User ID is required');

  const isUserExists = await userService.exists(eq(users.id, Number.parseInt(id, 10)));

  res.assertError(isUserExists, 'User not found');

  next();
};

const handler: AppMiddleware = async (req: AppRequest, res: AppResponse) => {
  const { id } = req.params;
  const data = req.validatedData as UpdateUserParams;

  const nonEmptyValues = _.pickBy(data, (value) => !_.isUndefined(value));

  const updatedUser = await userService.updateOne(
    eq(users.id, Number.parseInt(id, 10)),
    () => nonEmptyValues
  );

  res.json({
    user: userService.getPublic(updatedUser),
  });
};

export default (router: Router) => {
  router.put('/:id', validateMiddleware(updateUserSchema), validator, handler);
};