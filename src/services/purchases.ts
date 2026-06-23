import type {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';
import {Purchases, isPurchasesConfigured} from '../config/revenuecat';

/**
 * Service bao boc RevenueCat. Tat ca ham deu guard bang `isPurchasesConfigured()`
 * de an toan khi RevenueCat chua duoc cau hinh (vi du build local chua co API
 * key). Logic nghiep vu (man hinh paywall, mo khoa tinh nang...) se goi qua day.
 */

/**
 * Gan nguoi dung hien tai voi RevenueCat. Goi sau khi dang nhap (vi du dung
 * Supabase user id) de dong bo lich su mua hang giua cac thiet bi.
 */
export async function identifyUser(
  userId: string,
): Promise<CustomerInfo | null> {
  if (!isPurchasesConfigured()) {
    return null;
  }
  const {customerInfo} = await Purchases.logIn(userId);
  return customerInfo;
}

/**
 * Tra ve anonymous id sau khi dang xuat. Goi khi nguoi dung logout.
 */
export async function resetUser(): Promise<CustomerInfo | null> {
  if (!isPurchasesConfigured()) {
    return null;
  }
  return Purchases.logOut();
}

/**
 * Lay offering hien tai (goi san pham dang ban). Tra ve null neu chua cau hinh
 * hoac chua co offering nao tren Dashboard.
 */
export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  if (!isPurchasesConfigured()) {
    return null;
  }
  const offerings = await Purchases.getOfferings();
  return offerings.current ?? null;
}

/**
 * Thuc hien mua mot package. Nem loi neu chua cau hinh (de UI hien thi loi ro
 * rang thay vi am tham bo qua).
 */
export async function purchasePackage(
  pkg: PurchasesPackage,
): Promise<CustomerInfo> {
  if (!isPurchasesConfigured()) {
    throw new Error('RevenueCat chua duoc cau hinh');
  }
  const {customerInfo} = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

/**
 * Khoi phuc giao dich da mua (bat buoc co tren iOS theo policy cua Apple).
 */
export async function restorePurchases(): Promise<CustomerInfo | null> {
  if (!isPurchasesConfigured()) {
    return null;
  }
  return Purchases.restorePurchases();
}

/**
 * Lay thong tin khach hang hien tai (entitlement dang active...).
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!isPurchasesConfigured()) {
    return null;
  }
  return Purchases.getCustomerInfo();
}

/**
 * Kiem tra nguoi dung co dang so huu mot entitlement (vi du "premium") hay khong.
 */
export async function hasActiveEntitlement(
  entitlementId: string,
): Promise<boolean> {
  const info = await getCustomerInfo();
  if (!info) {
    return false;
  }
  return typeof info.entitlements.active[entitlementId] !== 'undefined';
}
