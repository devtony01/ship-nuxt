import { AppMiddleware, AppRequest, AppResponse } from 'types';

const auth: AppMiddleware = (req: AppRequest, res: AppResponse, next) => {
  if (req.user) {
    return next();
  }

  res.status(401).json({ message: 'Authentication required' });
};

export default auth;
