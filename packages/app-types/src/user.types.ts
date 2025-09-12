import { z } from 'zod';
import { userSchema, updateUserSchema, listUsersSchema } from '@ship-nuxt/schemas';
import { BackendFile, FrontendFile } from './common.types';

export type User = z.infer<typeof userSchema>;
export type UpdateUserParams = z.infer<typeof updateUserSchema>;
export type ListUsersParams = z.infer<typeof listUsersSchema>;

// Empty string indicates avatar removal
export interface UpdateUserParamsFrontend extends Omit<UpdateUserParams, 'avatar'> {
  avatar?: FrontendFile | '';
}

export interface UpdateUserParamsBackend extends Omit<UpdateUserParams, 'avatar'> {
  avatar?: BackendFile | '';
}