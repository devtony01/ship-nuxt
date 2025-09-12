import { eq } from '@paracelsus/node-sql';
import { users } from '@ship-nuxt/entities';

import { userService } from 'resources/user';

import { authService } from 'services';

import { AppMiddleware, AppRequest, AppResponse } from 'types';

const tryToAttachUser: AppMiddleware = async (req: AppRequest, res: AppResponse, next) => {
  const { accessToken } = req;

  const token = await authService.validateAccessToken(accessToken);

  if (token) {
    const user = await userService.findOne(eq(users.id, token.userId));

    if (user) {
      await userService.updateLastRequest(token.userId);
      req.user = user;

    }
  }

  next();
};

export default tryToAttachUser;