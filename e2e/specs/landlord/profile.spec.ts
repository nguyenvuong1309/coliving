import { restartAtWelcome, signInAs } from '../../helpers/session';
import {
  acceptAlert,
  isTextDisplayed,
  openBottomTab,
  scrollUntilDisplayed,
  tap,
  tapText,
  typeText,
  waitForDisplayed,
  waitForText,
} from '../../helpers/utils';

describe('Landlord profile, apartment and reporting tools', () => {
  beforeEach(async () => {
    await restartAtWelcome();
    await signInAs('landlord');
    await openBottomTab('Cá nhân');
    await waitForDisplayed('landlord-profile-screen');
  });

  it('switches apartment and opens invite code', async () => {
    await tap('landlord-profile-apartment-switcher-btn');
    await waitForDisplayed('apartment-switcher-screen');
    await waitForText('Can ho E2E Thu Hai');
    await tapText('Can ho E2E Thu Hai');
    await waitForDisplayed('landlord-profile-screen');
    expect(await isTextDisplayed('Can ho E2E Thu Hai')).toBe(true);

    await tap('landlord-profile-invite-btn');
    await waitForDisplayed('invite-code-screen');
    await waitForText('E2E67890');
  });

  it('updates apartment details', async () => {
    await tap('landlord-profile-apartment-card');
    await waitForDisplayed('apartment-setup-screen');
    await typeText('apartment-name-input', 'Can ho E2E Updated');
    await typeText('apartment-address-input', '99 Nguyen Hue, Quan 1');
    await typeText('apartment-rooms-input', '12');
    await tap('apartment-submit-btn');
    await waitForDisplayed('landlord-profile-screen');
    await waitForText('Can ho E2E Updated');
  });

  it('updates utilities and exports all report types', async () => {
    await tap('landlord-profile-utility-btn');
    await waitForDisplayed('utility-config-screen');
    await scrollUntilDisplayed('utility-amount-internet');
    await typeText('utility-amount-internet', '120000');
    await tap('utility-save-internet');
    await driver.back();
    await waitForDisplayed('landlord-profile-screen');

    await tap('landlord-profile-report-btn');
    await waitForDisplayed('report-export-screen');
    await tapText('Nguoi thue');
    expect(await $('~report-preview-input').getValue()).toContain(
      'Ten,Phong,Tien thue,Ngay tham gia',
    );
    await tapText('Su co');
    expect(await $('~report-preview-input').getValue()).toContain(
      'Tieu de,Nguoi bao,Trang thai,Muc do,Vi tri,Ngay tao',
    );
    await tap('report-copy-btn');
    await waitForText('Da copy CSV');
  });

  it('shows revenue and manages account settings', async () => {
    await tap('landlord-profile-revenue-btn');
    await waitForDisplayed('revenue-history-screen');
    await waitForText('Tong doanh thu');
    await driver.back();
    await waitForDisplayed('landlord-profile-screen');

    await tap('landlord-profile-edit-btn');
    await waitForDisplayed('edit-profile-screen');
    await typeText('edit-profile-name-input', 'E2E Chu Nha Updated');
    await tap('edit-profile-submit-btn');
    await waitForDisplayed('landlord-profile-screen');

    await tap('landlord-profile-password-btn');
    await waitForDisplayed('change-password-screen');
    await typeText('change-password-new-input', 'OwnerPass123!');
    await typeText('change-password-confirm-input', 'OwnerPass123!');
    await tap('change-password-submit-btn');
    await acceptAlert();
    await waitForDisplayed('landlord-profile-screen');

    await tap('landlord-profile-notifications-btn');
    await waitForDisplayed('notification-settings-screen');
    await tap('notification-setting-issue_enabled');
    await driver.back();
    await waitForDisplayed('landlord-profile-screen');

    await tap('landlord-profile-signout-btn');
    await acceptAlert('Dang xuat');
    await waitForDisplayed('welcome-screen');
  });
});
