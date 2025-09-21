import { AppMiddleware, AppRequest, AppResponse } from 'types';

const attachCustomProperties: AppMiddleware = async (req: AppRequest, res: AppResponse, next) => {
  // Add any custom properties to request/response here
  // For now, just pass through
  next();
};

export default attachCustomProperties;
