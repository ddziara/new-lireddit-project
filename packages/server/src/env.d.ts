declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SESSION_SECRET: string;
      DATABASE_URL: string;
      REDIS_URL: string;
      PORT: string;
      CORS_ORIGIN: string;
      COOKIES_DOMAIN: string;
      WEB_URL: string;
      USER_EMAIL: string;
      CLIENT_ID: string;
      CLIENT_SECRET: string;
      REFRESH_TOKEN: string;
      ACCESS_TOKEN: string;
      ETHEREAL_USER: string;
      ETHEREAL_PASSWORD: string;
    }
  }
}

export {}
