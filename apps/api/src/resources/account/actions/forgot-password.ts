import { and, eq, isNull } from '@paracelsus/node-sql';
import { RESET_PASSWORD_TOKEN } from '@ship-nuxt/app-constants';
import { users } from '@ship-nuxt/entities';
import { forgotPasswordSchema } from '@ship-nuxt/schemas';
import { Router } from 'express';

import { tokenService } from 'resources/token';
import { userService } from 'resources/user';

import { rateLimitMiddleware, validateMiddleware } from 'middlewares';
import { emailService } from 'services';

import config from 'config';

import { AppMiddleware, AppRequest, AppResponse, ForgotPasswordParams, Template, TokenType } from 'types';

const handler: AppMiddleware = async (req: AppRequest, res: AppResponse) => {
  const { email } = req.validatedData as ForgotPasswordParams;

  const user = await userService.findOne(and(eq(users.email, email), isNull(users.deletedAt)));

  if (!user) {
    res.status(204).send();
    return;
  }

  await tokenService.invalidateUserTokens(user.id, TokenType.RESET_PASSWORD);

  const resetPasswordToken = await tokenService.createToken({
    userId: user.id,
    type: TokenType.RESET_PASSWORD,
    expiresIn: RESET_PASSWORD_TOKEN.EXPIRATION_SECONDS,
  });

  await emailService.sendTemplate<Template.RESET_PASSWORD>({
    to: user.email,
    subject: 'Reset Your Password',
    template: Template.RESET_PASSWORD,
    params: {
      firstName: user.firstName,
      href: `${config.WEB_URL}/reset-password?token=${resetPasswordToken}`,
    },
  });

  if (config.IS_DEV) {
    res.json({ resetPasswordToken });
    return;
  }

  res.status(204).send();
};

export default (router: Router) => {
  router.post('/forgot-password', rateLimitMiddleware(), validateMiddleware(forgotPasswordSchema), handler);
};
