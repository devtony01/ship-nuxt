import { ACCESS_TOKEN } from '@ship-nuxt/app-constants';
import { Router } from 'express';

import { tokenService } from 'resources/token';

import { googleService } from 'services';
import { cookieUtil } from 'utils';

import config from 'config';

import { AppMiddleware, AppRequest, AppResponse, TokenType } from 'types';

const signInHandler: AppMiddleware = async (req: AppRequest, res: AppResponse) => {
  try {
    const { state, codeVerifier, authorizationUrl } = googleService.createAuthUrl();

    // Store state and code verifier in session or cookies for validation
    res.cookie('google_state', state, { httpOnly: true, maxAge: 600000 }); // 10 minutes
    res.cookie('google_code_verifier', codeVerifier, { httpOnly: true, maxAge: 600000 });

    res.json({ authorizationUrl });
  } catch (error) {
    res.throwGlobalErrorWithRedirect?.(error instanceof Error ? error.message : 'Google OAuth setup failed');
  }
};

const callbackHandler: AppMiddleware = async (req: AppRequest, res: AppResponse) => {
  try {
    const { code, state } = req.query as { code?: string; state?: string };
    const storedState = req.cookies?.google_state;
    const codeVerifier = req.cookies?.google_code_verifier;

    const user = await googleService.validateCallback({
      code,
      state,
      storedState,
      codeVerifier,
    });

    if (!user) {
      return res.throwGlobalErrorWithRedirect?.('Authentication failed');
    }

    // Clear OAuth cookies
    res.clearCookie('google_state');
    res.clearCookie('google_code_verifier');

    // Invalidate existing tokens
    await tokenService.invalidateUserTokens(user.id, TokenType.ACCESS);

    // Create new access token
    const accessToken = await tokenService.createToken({
      userId: user.id,
      type: TokenType.ACCESS,
      expiresIn: ACCESS_TOKEN.EXPIRATION_SECONDS,
    });

    // Set token in cookies
    await cookieUtil.setTokens({
      req,
      res,
      accessToken,
      expiresIn: ACCESS_TOKEN.EXPIRATION_SECONDS,
    });

    res.redirect(`${config.WEB_URL}/dashboard`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Google authentication failed';
    res.throwGlobalErrorWithRedirect?.(errorMessage);
  }
};

export default (router: Router) => {
  router.post('/sign-in/google', signInHandler);
  router.get('/sign-in/google/callback', callbackHandler);
};
