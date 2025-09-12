import { eq } from '@paracelsus/node-sql';
import { users } from '@ship-nuxt/entities';
import { resetPasswordSchema } from '@ship-nuxt/schemas';
import { Router } from 'express';

import { tokenService } from 'resources/token';
import { userService } from 'resources/user';

import { rateLimitMiddleware, validateMiddleware } from 'middlewares';
import { securityUtil } from 'utils';

import { AppMiddleware, AppRequest, AppResponse, ResetPasswordParams, TokenType, User } from 'types';

interface ValidatedData extends ResetPasswordParams {
  user: User;
}

const validator: AppMiddleware = async (req: AppRequest, res: AppResponse, next) => {
  const { token } = req.validatedData as ResetPasswordParams;

  const resetPasswordToken = await tokenService.validateToken(token, TokenType.RESET_PASSWORD);
  
  if (!resetPasswordToken || !resetPasswordToken.userId) {
    res.status(204).send();
    return;
  }
  
  const user = await userService.findOne(eq(users.id, resetPasswordToken.userId));

  if (!user) {
    res.status(204).send();
    return;
  }

  (req as AppRequest & { validatedData: ValidatedData }).validatedData.user = user;
  next();
};

const handler: AppMiddleware = async (req: AppRequest, res: AppResponse) => {
  const { user, password, token } = (req as AppRequest & { validatedData: ValidatedData }).validatedData;

  const passwordHash = await securityUtil.hashPassword(password);

  await tokenService.invalidateUserTokens(user.id, TokenType.RESET_PASSWORD);

  await userService.updateOne(eq(users.id, user.id), () => ({ passwordHash }));

  await tokenService.invalidateToken(token);
  await tokenService.invalidateUserTokens(user.id, TokenType.ACCESS);

  res.status(204).send();
};

export default (router: Router) => {
  router.put('/reset-password', rateLimitMiddleware(), validateMiddleware(resetPasswordSchema), validator, handler);
};