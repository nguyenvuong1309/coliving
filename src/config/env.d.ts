declare module 'react-native-config' {
  export interface NativeConfig {
    ENV: 'development' | 'production' | 'e2e';
    E2E_MODE?: string;
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    APP_NAME: string;
    APP_DISPLAY_NAME?: string;
    APP_VERSION?: string;
    APP_PASSWORD_RESET_REDIRECT_URL?: string;
    GOOGLE_WEB_CLIENT_ID: string;
    GOOGLE_REVERSED_CLIENT_ID?: string;
    // Sentry: de trong de tat error reporting (vi du build local).
    SENTRY_DSN?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
