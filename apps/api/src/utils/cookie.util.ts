import { COOKIES } from '@ship-nuxt/app-constants';
import _ from 'lodash';
import { URL } from 'node:url';
import { getPublicSuffix, parse } from 'tldts';

import config from 'config';

import logger from 'logger';

import { AppRequest, AppResponse } from 'types';

/**
 * Determines a valid cookie domain.
 * Returns undefined for localhost or invalid domains.
 */
const getCookieDomain = (hostname: string): string | undefined => {
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    return undefined;
  }

  const { domain, subdomain } = parse(hostname);

  if (!domain) {
    logger.warn(`Cannot determine cookie domain from "${hostname}".`);
    return undefined;
  }

  // Drop left-most subdomain and keep the rest
  const cookieSubdomain = _.tail(subdomain?.split('.')).join('.');

  const cookieDomain = cookieSubdomain ? `${cookieSubdomain}.${domain}` : domain;

  const publicSuffix = getPublicSuffix(cookieDomain, { allowPrivateDomains: true });

  // Check if domain is a public suffix (e.g. ondigitalocean.app)
  if (!publicSuffix || cookieDomain === publicSuffix) {
    logger.warn(`"${cookieDomain}" is a public suffix. Cookie won't be set.`);
    return undefined;
  }

  return cookieDomain;
};

const webUrl = new URL(config.WEB_URL);
const cookieDomain = getCookieDomain(webUrl.hostname);
const baseCookieOptions = {
  domain: cookieDomain,
  httpOnly: true,
  sameSite: 'lax' as const,
};

interface SetTokensOptions {
  req: AppRequest;
  res: AppResponse;
  accessToken: string;
  expiresIn: number;
}

const setTokens = async ({ req, res, accessToken, expiresIn }: SetTokensOptions) => {
  res.cookie(COOKIES.ACCESS_TOKEN, accessToken, {
    ...baseCookieOptions,
    expires: new Date(Date.now() + expiresIn * 1000),
    secure: req.secure,
  });
};

interface UnsetTokensOptions {
  req: AppRequest;
  res: AppResponse;
}

const unsetTokens = async ({ req, res }: UnsetTokensOptions) => {
  res.cookie(COOKIES.ACCESS_TOKEN, '', {
    ...baseCookieOptions,
    maxAge: 0,
    secure: req.secure,
  });
};

export default {
  setTokens,
  unsetTokens,
};
