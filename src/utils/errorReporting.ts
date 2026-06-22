import * as Sentry from '@sentry/react-native';

/**
 * Wrapper mong quanh Sentry de phan con lai cua app khong phu thuoc truc tiep
 * vao SDK. Cac ham nay an toan khi Sentry chua duoc init (no-op).
 */

export function captureException(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  Sentry.captureException(error, context ? {extra: context} : undefined);
}

export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
): void {
  Sentry.captureMessage(message, level);
}

export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Gan/xoa user hien tai de stacktrace co context. Goi khi dang nhap/dang xuat.
 */
export function setSentryUser(
  user: {id: string; email?: string | null} | null,
): void {
  Sentry.setUser(
    user ? {id: user.id, email: user.email ?? undefined} : null,
  );
}
