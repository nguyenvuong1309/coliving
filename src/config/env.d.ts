declare module 'react-native-config' {
  export interface NativeConfig {
    ENV: 'development' | 'production';
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    APP_NAME: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
