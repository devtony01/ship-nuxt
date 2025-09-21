declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_ENV: 'development' | 'staging' | 'production';
      PORT: string;
      API_URL: string;
      WEB_URL: string;
      DATABASE_URL: string;
      REDIS_URI?: string;
      REDIS_ERRORS_POLICY: 'throw' | 'log';
      RESEND_API_KEY?: string;
      ADMIN_KEY?: string;
      MIXPANEL_API_KEY?: string;
      CLOUD_STORAGE_ENDPOINT?: string;
      CLOUD_STORAGE_BUCKET?: string;
      CLOUD_STORAGE_ACCESS_KEY_ID?: string;
      CLOUD_STORAGE_SECRET_ACCESS_KEY?: string;
      GOOGLE_CLIENT_ID?: string;
      GOOGLE_CLIENT_SECRET?: string;
    }
  }
}

export {};
