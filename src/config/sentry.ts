import * as Sentry from '@sentry/react-native';
import Config from 'react-native-config';

/**
 * Sentry chi bat khi co SENTRY_DSN trong env. Neu chua truyen DSN (vi du build
 * dev/local chua cau hinh), moi loi gui len Sentry se la no-op an toan.
 */
export const sentryEnabled = Boolean(Config.SENTRY_DSN);

/**
 * Khoi tao Sentry cang som cang tot (goi trong index.js truoc khi render app).
 */
export function initSentry(): void {
  if (!sentryEnabled) {
    return;
  }

  const environment = Config.ENV ?? 'development';

  Sentry.init({
    dsn: Config.SENTRY_DSN,
    environment,
    release: Config.APP_VERSION,
    // Performance tracing: lay mau day du o dev, thua hon o production.
    tracesSampleRate: environment === 'production' ? 0.2 : 1.0,
    enableNativeCrashHandling: true,
    // Bat sourcemap debug ids de map stacktrace minified -> source.
    enableAutoPerformanceTracing: true,
    debug: __DEV__,
  });
}

export {Sentry};
