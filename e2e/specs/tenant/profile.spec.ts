import { restartAtWelcome, signInAs } from '../../helpers/session';
import {
  acceptAlert,
  openBottomTab,
  tap,
  typeText,
  waitForDisplayed,
} from '../../helpers/utils';

describe('Tenant profile and settings', () => {
  beforeEach(async () => {
    await restartAtWelcome();
    await signInAs('tenant');
    await openBottomTab('Cá nhân');
    await waitForDisplayed('tenant-profile-screen');
  });

  it('updates profile, password, notification settings and signs out', async () => {
    await tap('tenant-profile-edit-btn');
    await waitForDisplayed('edit-profile-screen');
    await typeText('edit-profile-name-input', 'E2E Nguoi Thue Updated');
    await typeText('edit-profile-phone-input', '0909999999');
    await tap('edit-profile-submit-btn');
    await waitForDisplayed('tenant-profile-screen');

    await tap('tenant-profile-password-btn');
    await waitForDisplayed('change-password-screen');
    await typeText('change-password-new-input', '123');
    await typeText('change-password-confirm-input', '123');
    await tap('change-password-submit-btn');
    await acceptAlert();
    await typeText('change-password-new-input', 'NewPass123!');
    await typeText('change-password-confirm-input', 'NewPass123!');
    await tap('change-password-submit-btn');
    await acceptAlert();
    await waitForDisplayed('tenant-profile-screen');

    await tap('tenant-profile-notifications-btn');
    await waitForDisplayed('notification-settings-screen');
    await tap('notification-setting-payment_enabled');
    await driver.back();
    await waitForDisplayed('tenant-profile-screen');

    await tap('tenant-profile-signout-btn');
    await acceptAlert('Dang xuat');
    await waitForDisplayed('welcome-screen');
  });
});
