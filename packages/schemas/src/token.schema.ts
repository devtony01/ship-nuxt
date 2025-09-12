import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { tokens } from '@ship-nuxt/entities';
import { TokenType } from '@ship-nuxt/enums';

// Generate schemas from Drizzle table
export const selectTokenSchema = createSelectSchema(tokens, {
  type: z.nativeEnum(TokenType),
});

export const insertTokenSchema = createInsertSchema(tokens, {
  type: z.nativeEnum(TokenType),
});

// Export tokenSchema for backward compatibility (this is the select schema with required id)
export const tokenSchema = selectTokenSchema;

// Schema for creating tokens - omits auto-generated fields
export const createTokenSchema = insertTokenSchema
  .omit({ id: true, createdAt: true, updatedAt: true });

export const validateTokenSchema = z.object({
  token: z.string().nonempty('Token is required'),
});