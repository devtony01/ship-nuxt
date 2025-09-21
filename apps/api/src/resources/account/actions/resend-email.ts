import { and, eq, isNull } from '@paracelsus/node-sql';
import { EMAIL_VERIFICATION_TOKEN } from '@ship-nuxt/app-constants';
import { users } from '@ship-nuxt/entities';
import { resendEmailSchema } from '@ship-nuxt/schemas';
import { Router } from 'express';

import { tokenService } from 'resources/token';
import { userService } from 'resources/user';

import { rateLimitMiddleware, validateMiddleware } from 'middlewares';
import { emailService } from 'services';

import config from 'config';

import { AppMiddleware, AppRequest, AppResponse, ResendEmailParams, Template, TokenType, User } from 'types';

interface ValidatedData extends ResendEmailParams {
  user: User;
}

const validator: AppMiddleware = async (req: AppRequest, res: AppResponse, next) => {
  const { email } = req.validatedData as ResendEmailParams;

  const user = await userService.findOne(and(eq(users.email, email), isNull(users.deletedAt)));

  if (!user) {
    res.status(204).send();
    return;
  }

  (req as AppRequest & { validatedData: ValidatedData }).validatedData.user = user;
  next();
};

const handler: AppMiddleware = async (req: AppRequest, res: AppResponse) => {
  const { user } = (req as AppRequest & { validatedData: ValidatedData }).validatedData;

  await tokenService.invalidateUserTokens(user.id, TokenType.EMAIL_VERIFICATION);

  const emailVerificationToken = await tokenService.createToken({
    userId: user.id,
    type: TokenType.EMAIL_VERIFICATION,
    expiresIn: EMAIL_VERIFICATION_TOKEN.EXPIRATION_SECONDS,
  });

  const emailVerificationUrl = new URL(`${config.API_URL}/api/account/verify-email`);
  emailVerificationUrl.searchParams.set('token', emailVerificationToken);

  await emailService.sendTemplate<Template.VERIFY_EMAIL>({
    to: user.email,
    subject: 'Please Confirm Your Email Address for Ship',
    template: Template.VERIFY_EMAIL,
    params: {
      firstName: user.firstName,
      href: emailVerificationUrl.toString(),
    },
  });

  if (config.IS_DEV) {
    res.json({ emailVerificationToken });
    return;
  }

  res.status(204).send();
};

export default (router: Router) => {
  router.post('/resend-email', rateLimitMiddleware(), validateMiddleware(resendEmailSchema), validator, handler);
};
