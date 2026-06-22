import {Platform} from 'react-native';
import {getApps} from '@react-native-firebase/app';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';
import {captureException} from '../utils/errorReporting';

export const ANDROID_DEFAULT_CHANNEL_ID = 'default';

/**
 * Firebase chi tu khoi tao khi co google-services.json (Android) /
 * GoogleService-Info.plist (iOS). Khi chua truyen config, getApps() tra ve []
 * va toan bo logic push se bi bo qua de app van chay binh thuong.
 */
export function isPushConfigured(): boolean {
  try {
    return getApps().length > 0;
  } catch {
    return false;
  }
}

/**
 * Tao notification channel mac dinh tren Android (bat buoc tu Android 8).
 */
export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  await notifee.createChannel({
    id: ANDROID_DEFAULT_CHANNEL_ID,
    name: 'Thong bao chung',
    importance: AndroidImportance.HIGH,
  });
}

/**
 * Xin quyen nhan push. Tra ve true neu nguoi dung cho phep.
 */
export async function requestPushPermission(): Promise<boolean> {
  if (!isPushConfigured()) {
    return false;
  }

  // notifee xu ly quyen POST_NOTIFICATIONS tren Android 13+.
  await notifee.requestPermission();

  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

/**
 * Lay FCM token hien tai cua thiet bi. Tra ve null neu chua cau hinh / loi.
 */
export async function getFcmToken(): Promise<string | null> {
  if (!isPushConfigured()) {
    return null;
  }
  try {
    if (Platform.OS === 'ios') {
      // Dam bao da dang ky APNs truoc khi lay token tren iOS.
      await messaging().registerDeviceForRemoteMessages();
    }
    return await messaging().getToken();
  } catch (error) {
    captureException(error, {scope: 'getFcmToken'});
    return null;
  }
}

/**
 * Hien thi mot thong bao cuc bo tu remote message (dung cho foreground, vi FCM
 * khong tu hien thong bao khi app dang mo).
 */
export async function displayNotification(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> {
  const notification = remoteMessage.notification;
  if (!notification?.title && !notification?.body) {
    return;
  }
  await ensureAndroidChannel();
  await notifee.displayNotification({
    title: notification?.title,
    body: notification?.body,
    data: remoteMessage.data,
    android: {
      channelId: ANDROID_DEFAULT_CHANNEL_ID,
      smallIcon: 'ic_notification',
      pressAction: {id: 'default'},
    },
  });
}

/**
 * Lang nghe token refresh. Tra ve ham unsubscribe.
 */
export function subscribeTokenRefresh(
  handler: (token: string) => void,
): () => void {
  if (!isPushConfigured()) {
    return () => {};
  }
  return messaging().onTokenRefresh(handler);
}

/**
 * Lang nghe message khi app o foreground. Tra ve ham unsubscribe.
 */
export function subscribeForegroundMessages(): () => void {
  if (!isPushConfigured()) {
    return () => {};
  }
  return messaging().onMessage(async remoteMessage => {
    await displayNotification(remoteMessage);
  });
}
