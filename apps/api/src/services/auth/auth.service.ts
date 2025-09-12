import { ACCESS_TOKEN } from '@ship-nuxt/app-constants';

import type {Token} from 'resources/token';
import { tokenService } from 'resources/token';
import { userService } from 'resources/user';

import { cookieUtil } from 'utils';

import { AppRequest, AppResponse, TokenType } from 'types';

interface SetAccessTokenOptions {
  req: AppRequest;
  res: AppResponse;
  userId: number;
}

export const setAccessToken = async ({ req, res, userId }: SetAccessTokenOptions) => {
  const accessToken = await tokenService.createToken({
    userId,
    type: TokenType.ACCESS,
    expiresIn: ACCESS_TOKEN.EXPIRATION_SECONDS,
  });

  await cookieUtil.setTokens({
    req,
    res,
    accessToken,
    expiresIn: ACCESS_TOKEN.EXPIRATION_SECONDS,
  });

  userService.updateLastRequest(userId);

  return accessToken;
};

interface UnsetUserAccessTokenOptions {
  req: AppRequest;
  res: AppResponse;
}

export const unsetUserAccessToken = async ({ req, res }: UnsetUserAccessTokenOptions) => {
  const { user } = req;

  if (user?.id) await tokenService.invalidateUserTokens(user.id, TokenType.ACCESS);

  await cookieUtil.unsetTokens({ req, res });
};

export const validateAccessToken = async (accessToken?: string): Promise<Token | null> => {
  if (!accessToken) return null;

  return tokenService.validateToken(accessToken, TokenType.ACCESS);
};