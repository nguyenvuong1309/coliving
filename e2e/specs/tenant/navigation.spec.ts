import { restartAtWelcome, signInAs } from '../../helpers/session';
import {
  openBottomTab,
  tap,
  waitForDisplayed,
  waitForText,
} from '../../helpers/utils';

describe('Tenant navigation and overview', () => {
  beforeEach(async () => {
    await restartAtWelcome();
    await signInAs('tenant');
  });

  it('shows dashboard data and quick actions', async () => {
    await tap('home-roommates-btn');
    await waitForDisplayed('tenant-roommate-list-screen');
    await waitForText('E2E Ban Cung Phong');
    await driver.back();
    await waitForDisplayed('tenant-home-screen');

    await tap('home-notifications-btn');
    await waitForDisplayed('notifications-screen');
  });

  it('opens every tenant tab', async () => {
    await openBottomTab('Mượn đồ');
    await waitForDisplayed('tenant-borrow-list-screen');

    await openBottomTab('Sự cố');
    await waitForDisplayed('tenant-issue-list-screen');

    await openBottomTab('Thanh toán');
    await waitForDisplayed('tenant-payment-history-screen');

    await openBottomTab('Cá nhân');
    await waitForDisplayed('tenant-profile-screen');
  });
});
