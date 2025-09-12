import { eq } from '@paracelsus/node-sql';
import { users } from '@ship-nuxt/entities';
import { Router } from 'express';
import { z } from 'zod';

import { tokenService } from 'resources/token';
import { userService } from 'resources/user';

import { rateLimitMiddleware, validateMiddleware } from 'middlewares';

import config from 'config';

import { AppMiddleware, AppRequest, AppResponse, TokenType, User } from 'types';

const schema = z.object({
  token: z.string().min(1, 'Token is required'),
});



const handler: AppMiddleware = async (req: AppRequest, res: AppResponse) => {
  try {
    const { token } = req.validatedData as { token: string };

    const resetPasswordToken = await tokenService.validateToken(token, TokenType.RESET_PASSWORD);
    
    if (!resetPasswordToken || !resetPasswordToken.userId) {
      return res.throwGlobalErrorWithRedirect('Token is invalid or expired.');
    }
    
    const user = await userService.findOne(eq(users.id, resetPasswordToken.userId));

    if (!user) {
      return res.throwGlobalErrorWithRedirect('Token is invalid or expired.');
    }

    const redirectUrl = new URL(`${config.WEB_URL}/reset-password`);
    redirectUrl.searchParams.set('token', token);

    res.redirect(redirectUrl.toString());
  } catch (error) {
    res.throwGlobalErrorWithRedirect('Failed to verify reset password token. Please try again.');
  }
};

export default (router: Router) => {
  router.get('/verify-reset-token', rateLimitMiddleware(), validateMiddleware(schema), handler);
};