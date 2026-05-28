declare module 'react-native-config' {
  export interface NativeConfig {
    ENV: 'development' | 'production';
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    APP_NAME: string;
    APP_DISPLAY_NAME?: string;
    GOOGLE_WEB_CLIENT_ID: string;
    GOOGLE_REVERSED_CLIENT_ID?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
