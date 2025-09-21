import { User } from '@ship-nuxt/app-types';
import { Template } from '@ship-nuxt/mailer';
import { NextFunction, Request, Response } from 'express';

export * from '@ship-nuxt/app-types';
export * from '@ship-nuxt/enums';
export { Template };

type JSONPrimitive = string | number | boolean;

export type CustomErrors = Record<string, JSONPrimitive>;

export type ValidationErrors = Record<string, JSONPrimitive | JSONPrimitive[]>;

// Custom Express Request interface with additional properties
export interface AppRequest extends Request {
  user?: User;
  accessToken?: string;
  validatedData?: unknown;
  files?: unknown;
}

// Custom Express Response interface with additional methods
export interface AppResponse extends Response {
  throwError: (message: string, status?: number) => never;
  assertError: (condition: unknown, message: string, status?: number) => asserts condition;
  throwClientError: (errors: CustomErrors, status?: number) => never;
  assertClientError: (condition: unknown, errors: CustomErrors, status?: number) => asserts condition;
  throwGlobalErrorWithRedirect: (message: string, redirectUrl?: string) => void;
}

// Custom middleware type using our extended interfaces
export type AppMiddleware = (req: AppRequest, res: AppResponse, next: NextFunction) => void | Promise<void>;

// For compatibility with Express router methods, we also need to augment the Express namespace
// This allows our custom types to work with router.get(), router.post(), etc.
declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace Express {
    interface Request {
      user?: User;
      accessToken?: string;
      validatedData?: unknown;
      files?: unknown;
    }

    interface Response {
      throwError: (message: string, status?: number) => never;
      assertError: (condition: unknown, message: string, status?: number) => asserts condition;
      throwClientError: (errors: CustomErrors, status?: number) => never;
      assertClientError: (condition: unknown, errors: CustomErrors, status?: number) => asserts condition;
      throwGlobalErrorWithRedirect: (message: string, redirectUrl?: string) => void;
    }
  }
}
