import { eq } from '@paracelsus/node-sql';
import { users } from '@ship-nuxt/entities';
import { signInSchema } from '@ship-nuxt/schemas';
import { Router } from 'express';

import { tokenService } from 'resources/token';
import { userService } from 'resources/user';

import { rateLimitMiddleware, validateMiddleware } from 'middlewares';
import { authService } from 'services';
import { securityUtil } from 'utils';

import { AppMiddleware, AppRequest, AppResponse, SignInParams, TokenType } from 'types';

const validator: AppMiddleware = async (req: AppRequest, res: AppResponse, next) => {
  const { email, password } = req.validatedData as SignInParams;

  const user = await userService.findOne(eq(users.email, email));

  res.assertClientError(user && user.passwordHash, {
    credentials: 'The email or password you have entered is invalid',
  });

  const isPasswordMatch = await securityUtil.verifyPasswordHash(user.passwordHash!, password);

  res.assertClientError(isPasswordMatch, {
    credentials: 'The email or password you have entered is invalid',
  });

  if (!user.isEmailVerified) {
    const existingEmailVerificationToken = await tokenService.getUserActiveToken(
      user.id,
      TokenType.EMAIL_VERIFICATION,
    );

    res.assertClientError(existingEmailVerificationToken, {
      emailVerificationTokenExpired: true,
    });
  }

  res.assertClientError(user.isEmailVerified, {
    email: 'Please verify your email to sign in',
  });

  req.user = user;
  next();
};

const handler: AppMiddleware = async (req: AppRequest, res: AppResponse) => {
  const user = req.user!;

  await authService.setAccessToken({ req, res, userId: user.id });

  res.json(userService.getPublic(user));
};

export default (router: Router) => {
  router.post('/sign-in', rateLimitMiddleware(), validateMiddleware(signInSchema), validator, handler);
};
