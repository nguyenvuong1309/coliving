import {Platform} from 'react-native';
import Config from 'react-native-config';
import Purchases, {LOG_LEVEL} from 'react-native-purchases';

/**
 * RevenueCat chi bat khi co API key cho platform tuong ung. Neu chua truyen key
 * (vi du build dev/local chua cau hinh), moi loi goi RevenueCat se la no-op an
 * toan thong qua `isPurchasesConfigured()`.
 *
 * Lay API key tu RevenueCat Dashboard > Project Settings > API Keys:
 *  - iOS:     key "appl_..."
 *  - Android: key "goog_..."
 */
const apiKey = Platform.select({
  ios: Config.REVENUECAT_IOS_API_KEY,
  android: Config.REVENUECAT_ANDROID_API_KEY,
});

export const purchasesEnabled = Boolean(apiKey);

let configured = false;

/**
 * Da configure RevenueCat chua. Dung de guard truoc khi goi cac API khac.
 */
export function isPurchasesConfigured(): boolean {
  return configured;
}

/**
 * Khoi tao RevenueCat. Goi cang som cang tot (trong index.js). An toan khi goi
 * nhieu lan — chi configure mot lan.
 *
 * @param appUserId ID nguoi dung (vi du Supabase user id) de gan voi RevenueCat.
 *   De trong neu chua dang nhap — RevenueCat se dung anonymous id, sau do goi
 *   `Purchases.logIn(userId)` khi dang nhap.
 */
export function initPurchases(appUserId?: string): void {
  if (!purchasesEnabled || configured) {
    return;
  }

  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);

  Purchases.configure({
    apiKey: apiKey as string,
    appUserID: appUserId ?? null,
  });

  configured = true;
}

export {Purchases};
