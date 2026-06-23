/* eslint-env jest */

/**
 * Test cho RevenueCat config. Vi `purchasesEnabled` duoc tinh khi module load
 * (dua tren API key trong Config), moi kich ban can reset module va doi mock
 * `react-native-config` truoc khi require lai.
 */

function loadModule(config: Record<string, unknown>) {
  let mod: typeof import('../revenuecat');
  let purchases: any;
  jest.isolateModules(() => {
    jest.doMock('react-native-config', () => config);
    purchases = require('react-native-purchases').default;
    mod = require('../revenuecat');
  });
  // @ts-expect-error gan trong isolateModules
  return {mod: mod as typeof import('../revenuecat'), purchases};
}

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe('revenuecat config', () => {
  it('khong bat khi thieu API key (no-op an toan)', () => {
    const {mod, purchases} = loadModule({ENV: 'test'});

    expect(mod.purchasesEnabled).toBe(false);

    mod.initPurchases();

    expect(mod.isPurchasesConfigured()).toBe(false);
    expect(purchases.configure).not.toHaveBeenCalled();
  });

  it('bat va configure khi co iOS API key', () => {
    const {mod, purchases} = loadModule({
      ENV: 'test',
      REVENUECAT_IOS_API_KEY: 'appl_test_key',
    });

    expect(mod.purchasesEnabled).toBe(true);

    mod.initPurchases('user-123');

    expect(mod.isPurchasesConfigured()).toBe(true);
    expect(purchases.configure).toHaveBeenCalledWith({
      apiKey: 'appl_test_key',
      appUserID: 'user-123',
    });
  });

  it('dung appUserID null khi khong truyen userId', () => {
    const {mod, purchases} = loadModule({
      ENV: 'test',
      REVENUECAT_IOS_API_KEY: 'appl_test_key',
    });

    mod.initPurchases();

    expect(purchases.configure).toHaveBeenCalledWith({
      apiKey: 'appl_test_key',
      appUserID: null,
    });
  });

  it('chi configure mot lan du goi nhieu lan', () => {
    const {mod, purchases} = loadModule({
      ENV: 'test',
      REVENUECAT_IOS_API_KEY: 'appl_test_key',
    });

    mod.initPurchases();
    mod.initPurchases();
    mod.initPurchases();

    expect(purchases.configure).toHaveBeenCalledTimes(1);
  });
});
