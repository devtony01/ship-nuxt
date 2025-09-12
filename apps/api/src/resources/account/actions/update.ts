import { eq } from '@paracelsus/node-sql';
import { users } from '@ship-nuxt/entities';
import { updateUserSchema } from '@ship-nuxt/schemas';
import { Router } from 'express';
import _ from 'lodash';

import { accountUtils } from 'resources/account';
import { userService } from 'resources/user';

import { validateMiddleware } from 'middlewares';
import { securityUtil } from 'utils';

import { AppMiddleware, AppRequest, AppResponse, UpdateUserParamsBackend, User } from 'types';

interface ValidatedData extends UpdateUserParamsBackend {
  passwordHash?: string;
}

const handler: AppMiddleware = async (req: AppRequest, res: AppResponse) => {
  const data = req.validatedData as ValidatedData;
  const user = req.user!;

  // Handle password hashing
  if (data.password) {
    data.passwordHash = await securityUtil.hashPassword(data.password);
    delete data.password;
  }

  const { avatar } = data;
  const nonEmptyValues = _.pickBy(data, (value) => !_.isUndefined(value));
  const updateData: Partial<User> = _.omit(nonEmptyValues, 'avatar');

  if (avatar === '') {
    await accountUtils.removeAvatar(user);
    updateData.avatarUrl = null;
  }

  if (avatar) {
    updateData.avatarUrl = await accountUtils.uploadAvatar(user, avatar);
  }

  const updatedUser = await userService.updateOne(eq(users.id, user.id), (doc) => ({ ...doc, ...updateData }));

  res.json({
    user: userService.getPublic(updatedUser),
  });
};

export default (router: Router) => {
  router.put('/', validateMiddleware(updateUserSchema), handler);
};