import { validateConfig } from 'utils'
import { z } from 'zod'

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
const schema = z.object({
  APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  IS_DEV: z
    .boolean()
    .default(false)
    .transform(() => import.meta.env.VITE_APP_ENV === 'development'),
  API_URL: z.string().default('http://localhost:3001'),
  WS_URL: z.string().default('http://localhost:3001'),
  WEB_URL: z.string().default('http://localhost:3002'),
  MIXPANEL_API_KEY: z.string().optional(),
})

type Config = z.infer<typeof schema>

/**
 * In Vite, environment variables are accessed via import.meta.env
 * and must be prefixed with VITE_ to be exposed to the client
 */
const processEnv = {
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  WS_URL: import.meta.env.VITE_WS_URL || 'http://localhost:3001',
  WEB_URL: import.meta.env.VITE_WEB_URL || 'http://localhost:3002',
  MIXPANEL_API_KEY: import.meta.env.VITE_MIXPANEL_API_KEY,
} as Record<keyof Config, string | undefined>

const config = validateConfig<Config>(schema, processEnv)

export default config
