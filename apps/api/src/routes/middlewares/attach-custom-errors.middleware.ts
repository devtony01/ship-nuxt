import _ from 'lodash';

import config from 'config';

import { AppMiddleware, AppRequest, AppResponse, CustomErrors, ValidationErrors } from 'types';

const formatError = (customError: CustomErrors): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(customError).forEach((key) => {
    errors[key] = _.isArray(customError[key]) ? customError[key] : [customError[key]];
  });

  return errors;
};

const attachCustomErrors: AppMiddleware = async (req: AppRequest, res: AppResponse, next) => {
  res.throwError = (message, status = 400) => {
    const error = new Error(message) as Error & { status: number };
    error.status = status;
    throw error;
  };

  res.assertError = (condition, message, status = 400) => {
    if (!condition) {
      const error = new Error(message) as Error & { status: number };
      error.status = status;
      throw error;
    }
  };

  res.throwClientError = (errors, status = 400) => {
    const error = new Error('Client error') as Error & { status: number; clientErrors: ValidationErrors };
    error.status = status;
    error.clientErrors = formatError(errors);
    throw error;
  };

  res.assertClientError = (condition, errors, status = 400) => {
    if (!condition) {
      const error = new Error('Client assertion failed') as Error & { status: number; clientErrors: ValidationErrors };
      error.status = status;
      error.clientErrors = formatError(errors);
      throw error;
    }
  };

  res.throwGlobalErrorWithRedirect = (message: string, redirectUrl: string = config.WEB_URL) => {
    const url = new URL(redirectUrl);
    url.searchParams.set('error', encodeURIComponent(message));
    res.redirect(url.toString());
  };

  next();
};

export default attachCustomErrors;