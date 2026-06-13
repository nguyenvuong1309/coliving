import { restartAtWelcome, signInAs } from '../../helpers/session';
import {
  isTextDisplayed,
  openBottomTab,
  tap,
  waitForDisplayed,
} from '../../helpers/utils';

describe('Landlord navigation and dashboard', () => {
  beforeEach(async () => {
    await restartAtWelcome();
    await signInAs('landlord');
  });

  it('shows dashboard summary and quick actions', async () => {
    expect(await isTextDisplayed('Can ho E2E')).toBe(true);
    expect(await isTextDisplayed('Doanh thu thang')).toBe(true);
    expect(await isTextDisplayed('Su co cho xu ly')).toBe(true);
  });

  it('opens every landlord tab', async () => {
    await openBottomTab('Người thuê');
    await waitForDisplayed('tenant-list-screen');

    await openBottomTab('Tài sản');
    await waitForDisplayed('asset-list-screen');

    await openBottomTab('Tổng quan');
    await waitForDisplayed('landlord-dashboard-screen');
    await tap('dashboard-open-issues-btn');
    await waitForDisplayed('landlord-issue-list-screen');
    await driver.back();
    await waitForDisplayed('landlord-dashboard-screen');

    await openBottomTab('Thu tiền');
    await waitForDisplayed('landlord-payments-screen');

    await openBottomTab('Cá nhân');
    await waitForDisplayed('landlord-profile-screen');
  });
});
