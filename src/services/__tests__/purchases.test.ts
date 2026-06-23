/* eslint-env jest */

import {
  getCurrentOffering,
  getCustomerInfo,
  hasActiveEntitlement,
  identifyUser,
  purchasePackage,
  resetUser,
  restorePurchases,
} from '../purchases';
import {Purchases, isPurchasesConfigured} from '../../config/revenuecat';

jest.mock('../../config/revenuecat', () => {
  const mockPurchases = {
    logIn: jest.fn(),
    logOut: jest.fn(),
    getOfferings: jest.fn(),
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn(),
    getCustomerInfo: jest.fn(),
  };
  return {
    Purchases: mockPurchases,
    isPurchasesConfigured: jest.fn(),
  };
});

const mockedConfigured = isPurchasesConfigured as jest.MockedFunction<
  typeof isPurchasesConfigured
>;
const mockedPurchases = Purchases as unknown as Record<string, jest.Mock>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('purchases service — chua cau hinh (no-op)', () => {
  beforeEach(() => {
    mockedConfigured.mockReturnValue(false);
  });

  it('identifyUser tra ve null', async () => {
    await expect(identifyUser('u1')).resolves.toBeNull();
    expect(mockedPurchases.logIn).not.toHaveBeenCalled();
  });

  it('resetUser tra ve null', async () => {
    await expect(resetUser()).resolves.toBeNull();
    expect(mockedPurchases.logOut).not.toHaveBeenCalled();
  });

  it('getCurrentOffering tra ve null', async () => {
    await expect(getCurrentOffering()).resolves.toBeNull();
    expect(mockedPurchases.getOfferings).not.toHaveBeenCalled();
  });

  it('restorePurchases tra ve null', async () => {
    await expect(restorePurchases()).resolves.toBeNull();
  });

  it('getCustomerInfo tra ve null', async () => {
    await expect(getCustomerInfo()).resolves.toBeNull();
  });

  it('hasActiveEntitlement tra ve false', async () => {
    await expect(hasActiveEntitlement('premium')).resolves.toBe(false);
  });

  it('purchasePackage nem loi', async () => {
    await expect(purchasePackage({} as any)).rejects.toThrow(
      'RevenueCat chua duoc cau hinh',
    );
  });
});

describe('purchases service — da cau hinh', () => {
  beforeEach(() => {
    mockedConfigured.mockReturnValue(true);
  });

  it('identifyUser goi logIn va tra ve customerInfo', async () => {
    const customerInfo = {entitlements: {active: {}}};
    mockedPurchases.logIn.mockResolvedValue({customerInfo, created: false});

    await expect(identifyUser('user-1')).resolves.toBe(customerInfo);
    expect(mockedPurchases.logIn).toHaveBeenCalledWith('user-1');
  });

  it('resetUser goi logOut', async () => {
    const info = {entitlements: {active: {}}};
    mockedPurchases.logOut.mockResolvedValue(info);

    await expect(resetUser()).resolves.toBe(info);
    expect(mockedPurchases.logOut).toHaveBeenCalled();
  });

  it('getCurrentOffering tra ve offering current', async () => {
    const offering = {identifier: 'default'};
    mockedPurchases.getOfferings.mockResolvedValue({current: offering});

    await expect(getCurrentOffering()).resolves.toBe(offering);
  });

  it('getCurrentOffering tra ve null khi khong co offering', async () => {
    mockedPurchases.getOfferings.mockResolvedValue({current: undefined});

    await expect(getCurrentOffering()).resolves.toBeNull();
  });

  it('purchasePackage tra ve customerInfo', async () => {
    const customerInfo = {entitlements: {active: {premium: {}}}};
    mockedPurchases.purchasePackage.mockResolvedValue({customerInfo});

    const pkg = {identifier: 'monthly'} as any;
    await expect(purchasePackage(pkg)).resolves.toBe(customerInfo);
    expect(mockedPurchases.purchasePackage).toHaveBeenCalledWith(pkg);
  });

  it('hasActiveEntitlement true khi entitlement active', async () => {
    mockedPurchases.getCustomerInfo.mockResolvedValue({
      entitlements: {active: {premium: {identifier: 'premium'}}},
    });

    await expect(hasActiveEntitlement('premium')).resolves.toBe(true);
  });

  it('hasActiveEntitlement false khi entitlement khong active', async () => {
    mockedPurchases.getCustomerInfo.mockResolvedValue({
      entitlements: {active: {}},
    });

    await expect(hasActiveEntitlement('premium')).resolves.toBe(false);
  });
});
