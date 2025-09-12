import process from 'node:process';
import { validateConfig } from 'utils';
import { z } from 'zod';

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
const schema = z.object({
  APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  IS_DEV: z.boolean().default(false).transform(() => process.env.APP_ENV === 'development'),
  API_URL: z.string().default('http://localhost:3001'),
  WS_URL: z.string().default('http://localhost:3001'),
  WEB_URL: z.string().default('http://localhost:3002'),
  MIXPANEL_API_KEY: z.string().optional(),
});

type Config = z.infer<typeof schema>;

/**
 * In Nuxt, you can't destructure `process.env` as a regular object in all contexts (especially
 * on the client or in server middleware). Always access env variables individually to ensure
 * compatibility across server and client.
 */
const processEnv = {
  APP_ENV: process.env.NUXT_APP_ENV || 'development',
  API_URL: process.env.NUXT_API_URL || 'http://localhost:3001',
  WS_URL: process.env.NUXT_WS_URL || 'http://localhost:3001',
  WEB_URL: process.env.NUXT_WEB_URL || 'http://localhost:3002',
  MIXPANEL_API_KEY: process.env.MIXPANEL_API_KEY,
} as Record<keyof Config, string | undefined>;

const config = validateConfig<Config>(schema, processEnv);

export default config;
