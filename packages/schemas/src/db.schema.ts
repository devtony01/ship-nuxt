import { z } from 'zod';

export default z
  .object({
    id: z.number().optional(),

    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    deletedAt: z.date().nullable().optional(),
  })
  .strict();