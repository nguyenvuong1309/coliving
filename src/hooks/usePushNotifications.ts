import {useCallback} from 'react';
import {registerDeviceToken} from '../services/deviceToken';

export function usePushNotifications(userId?: string | null) {
  const registerToken = useCallback(
    async (token: string) => {
      if (!userId || !token) {
        return null;
      }
      return registerDeviceToken(userId, token);
    },
    [userId],
  );

  return {
    isNativePushConfigured: false,
    registerToken,
  };
}
