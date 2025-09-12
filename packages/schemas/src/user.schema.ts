import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from '@ship-nuxt/entities';

import { USER_AVATAR } from '@ship-nuxt/app-constants';

import { emailSchema, fileSchema, passwordSchema } from './common.schema';

// Define the oauth schema for the JSON field
const oauthSchema = z.object({
  google: z.object({
    userId: z.string().nonempty('Google user ID is required'),
    connectedOn: z.date(),
  }).optional(),
}).nullable();

// Generate schemas from Drizzle table - this automatically handles id being required/optional correctly
export const selectUserSchema = createSelectSchema(users, {
  firstName: z.string().nonempty('First name is required').max(128, 'First name must be less than 128 characters.'),
  lastName: z.string().nonempty('Last name is required').max(128, 'Last name must be less than 128 characters.'),
  email: emailSchema,
  oauth: oauthSchema,
});

export const insertUserSchema = createInsertSchema(users, {
  firstName: z.string().nonempty('First name is required').max(128, 'First name must be less than 128 characters.'),
  lastName: z.string().nonempty('Last name is required').max(128, 'Last name must be less than 128 characters.'),
  email: emailSchema,
  oauth: oauthSchema,
});

// Export userSchema for backward compatibility (this is the select schema with required id)
export const userSchema = selectUserSchema;

// Schema for creating users - omits auto-generated fields
export const createUserSchema = insertUserSchema
  .omit({ id: true, createdAt: true, updatedAt: true });

export const updateUserSchema = userSchema
  .pick({ firstName: true, lastName: true })
  .extend({
    password: z.union([
      passwordSchema,
      z.literal(''), // Allow empty string when password is unchanged on the front-end
    ]),
    avatar: z.union([
      fileSchema(USER_AVATAR.MAX_FILE_SIZE, USER_AVATAR.ACCEPTED_FILE_TYPES).nullable(),
      z.literal(''), // Allow empty string to indicate removal
    ]),
  })
  .partial();

