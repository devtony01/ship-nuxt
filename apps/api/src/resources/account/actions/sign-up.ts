import { eq } from '@paracelsus/node-sql';
import { EMAIL_VERIFICATION_TOKEN } from '@ship-nuxt/app-constants';
import { users } from '@ship-nuxt/entities';
import { signUpSchema } from '@ship-nuxt/schemas';
import { Router } from 'express';

import { tokenService } from 'resources/token';
import { userService } from 'resources/user';

import { rateLimitMiddleware, validateMiddleware } from 'middlewares';
import { emailService } from 'services';
import { securityUtil } from 'utils';

import config from 'config';

import { AppMiddleware, AppRequest, AppResponse, SignUpParams, Template, TokenType } from 'types';

const validator: AppMiddleware = async (req: AppRequest, res: AppResponse, next) => {
  const { email } = req.validatedData as SignUpParams;

  const isUserExists = await userService.exists(eq(users.email, email));

  res.assertClientError(!isUserExists, {
    email: 'User with this email is already registered',
  });

  next();
};

const handler: AppMiddleware = async (req: AppRequest, res: AppResponse) => {
  const { firstName, lastName, email, password } = req.validatedData as SignUpParams;

  const hashedPassword = await securityUtil.hashPassword(password);

  const user = await userService.insertOne({
    email,
    firstName,
    lastName,
    passwordHash: hashedPassword,
    isEmailVerified: false, // Users must verify their email
    avatarUrl: null,
    oauth: null,
    lastRequest: null,
    deletedAt: null,
  });

  if (!user.id) {
    throw new Error('User creation failed - no ID returned');
  }

  const emailVerificationToken = await tokenService.createToken({
    userId: user.id,
    type: TokenType.EMAIL_VERIFICATION,
    expiresIn: EMAIL_VERIFICATION_TOKEN.EXPIRATION_SECONDS,
  });

  try {
    await emailService.sendTemplate<Template.VERIFY_EMAIL>({
      to: user.email,
      subject: 'Please Confirm Your Email Address for Ship',
      template: Template.VERIFY_EMAIL,
      params: {
        firstName: user.firstName,
        href: `${config.API_URL}/account/verify-email?token=${emailVerificationToken}`,
      },
    });
  } catch (emailError) {
    console.error('Email sending failed:', emailError);
    // Continue anyway - user is created, they can resend email later
  }

  if (config.IS_DEV) {
    res.json({ emailVerificationToken });
    return;
  }

  res.status(204).send();
};

export default (router: Router) => {
  router.post('/sign-up', rateLimitMiddleware(), validateMiddleware(signUpSchema), validator, handler);
};
