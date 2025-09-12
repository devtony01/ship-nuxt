import { ErrorRequestHandler } from 'express';

import { userService } from 'resources/user';

import config from 'config';

import logger from 'logger';

import { AppRequest, AppResponse, ValidationErrors } from 'types';

interface CustomError extends Error {
  status?: number;
  clientErrors?: ValidationErrors;
}

const routeErrorHandler: ErrorRequestHandler = (err: CustomError, req: AppRequest, res: AppResponse, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const clientError = err.clientErrors;
  const serverError = { global: err.message || 'Unknown error' };

  const errors = clientError || serverError;

  let loggerMetadata = {};

  if (!config.IS_DEV) {
    loggerMetadata = {
      requestBody: req.body,
      requestQuery: req.query,
      user: req.user ? userService.getPublic(req.user) : null,
    };
  }

  logger.error(JSON.stringify(errors, null, 4), loggerMetadata);

  if (serverError && config.APP_ENV === 'production') {
    serverError.global = 'Something went wrong';
  }

  const status = err.status || 500;
  res.status(status).json({ errors });
};

export default routeErrorHandler;