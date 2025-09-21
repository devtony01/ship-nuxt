import { ZodError, ZodIssue, ZodSchema } from 'zod';

import { AppMiddleware, AppRequest, AppResponse, ValidationErrors } from 'types';

const formatError = (zodError: ZodError): ValidationErrors => {
  const errors: ValidationErrors = {};

  zodError.issues.forEach((error: ZodIssue) => {
    const key = error.path.join('.');

    if (!errors[key]) {
      errors[key] = [];
    }

    (errors[key] as string[]).push(error.message);
  });

  return errors;
};

const validate =
  (schema: ZodSchema): AppMiddleware =>
  async (req: AppRequest, res: AppResponse, next) => {
    try {
      const result = await schema.safeParseAsync({
        ...req.body,
        ...req.query,
        ...req.params,
      });

      if (!result.success) {
        res.status(400).json({ clientErrors: formatError(result.error) });
        return;
      }

      req.validatedData = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };

export default validate;
