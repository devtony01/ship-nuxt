import { COOKIES } from '@ship-nuxt/app-constants';

import { AppMiddleware, AppRequest, AppResponse } from 'types';

const storeTokenToState: AppMiddleware = async (req: AppRequest, res: AppResponse, next) => {
  let accessToken = req.cookies?.[COOKIES.ACCESS_TOKEN];

  const { authorization } = req.headers;

  if (!accessToken && authorization) {
    accessToken = authorization.replace('Bearer', '').trim();
  }

  if (accessToken) {
    req.accessToken = accessToken;
  }

  next();
};

export default storeTokenToState;