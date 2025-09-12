import { eq } from '@paracelsus/node-sql';
import { users } from '@ship-nuxt/entities';
import { verifyEmailSchema } from '@ship-nuxt/schemas';
import { Router } from 'express';

import { tokenService } from 'resources/token';
import { userService } from 'resources/user';

import { rateLimitMiddleware, validateMiddleware } from 'middlewares';
import { authService, emailService } from 'services';

import config from 'config';

import { AppMiddleware, AppRequest, AppResponse, Template, TokenType, User, VerifyEmailParams } from 'types';

interface ValidatedData extends VerifyEmailParams {
  user: User;
}

const validator: AppMiddleware = async (req: AppRequest, res: AppResponse, next) => {
  const { token } = req.validatedData as VerifyEmailParams;

  const emailVerificationToken = await tokenService.validateToken(token, TokenType.EMAIL_VERIFICATION);
  
  if (!emailVerificationToken) {
    return res.throwGlobalErrorWithRedirect('Token is invalid or expired.');
  }
  
  const user = await userService.findOne(eq(users.id, emailVerificationToken.userId));

  if (!emailVerificationToken || !user) {
    return res.throwGlobalErrorWithRedirect('Token is invalid or expired.');
  }

  (req as AppRequest & { validatedData: ValidatedData }).validatedData.user = user;
  next();
};

const handler: AppMiddleware = async (req: AppRequest, res: AppResponse) => {
  try {
    const { user } = (req as AppRequest & { validatedData: ValidatedData }).validatedData;

    if (!user.id) {
      throw new Error('User ID is missing');
    }

    await tokenService.invalidateUserTokens(user.id, TokenType.EMAIL_VERIFICATION);

    await userService.updateOne(eq(users.id, user.id), (doc) => ({ ...doc, isEmailVerified: true }));

    // Set access token like in sign-in
    await authService.setAccessToken({ req, res, userId: user.id });

    // Send welcome email
    await emailService.sendTemplate<Template.SIGN_UP_WELCOME>({
      to: user.email,
      subject: 'Welcome to Ship Community!',
      template: Template.SIGN_UP_WELCOME,
      params: {
        firstName: user.firstName,
        href: `${config.WEB_URL}/sign-in`,
      },
    });

    res.redirect(config.WEB_URL);
  } catch (error) {
    res.throwGlobalErrorWithRedirect('Failed to verify email. Please try again.');
  }
};

export default (router: Router) => {
  router.get(
    '/verify-email',
    rateLimitMiddleware({
      limitDuration: 60 * 60, // 1 hour
      requestsPerDuration: 10,
    }),
    validateMiddleware(verifyEmailSchema),
    validator,
    handler,
  );
};
