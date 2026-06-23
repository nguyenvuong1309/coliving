import {useCallback, useEffect, useRef} from 'react';
import {
  registerDeviceToken,
  ensureAndroidChannel,
  getFcmToken,
  isPushConfigured,
  requestPushPermission,
  subscribeForegroundMessages,
  subscribeTokenRefresh,
} from '../services';
import {captureException} from '../utils';

/**
 * Khoi tao push notification cho user dang dang nhap:
 * - Xin quyen, tao channel (Android)
 * - Lay FCM token va dang ky len Supabase (device_tokens)
 * - Dang ky lai khi token refresh
 * - Hien thi thong bao khi app o foreground
 *
 * An toan khi chua cau hinh Firebase (isPushConfigured() === false): khong lam gi.
 */
export function usePushNotifications(userId?: string | null) {
  const userIdRef = useRef<string | null | undefined>(userId);
  userIdRef.current = userId;

  const registerToken = useCallback(async (token: string) => {
    const id = userIdRef.current;
    if (!id || !token) {
      return null;
    }
    try {
      return await registerDeviceToken(id, token);
    } catch (error) {
      captureException(error, {scope: 'registerDeviceToken'});
      return null;
    }
  }, []);

  useEffect(() => {
    if (!userId || !isPushConfigured()) {
      return;
    }

    let cancelled = false;
    const unsubscribers: Array<() => void> = [];

    const bootstrap = async () => {
      try {
        await ensureAndroidChannel();
        const granted = await requestPushPermission();
        if (!granted || cancelled) {
          return;
        }
        const token = await getFcmToken();
        if (token && !cancelled) {
          await registerToken(token);
        }

        unsubscribers.push(subscribeTokenRefresh(registerToken));
        unsubscribers.push(subscribeForegroundMessages());
      } catch (error) {
        captureException(error, {scope: 'usePushNotifications.bootstrap'});
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
      unsubscribers.forEach(unsub => unsub());
    };
  }, [userId, registerToken]);

  return {
    isNativePushConfigured: isPushConfigured(),
    registerToken,
  };
}
