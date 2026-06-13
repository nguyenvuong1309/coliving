import { FIXTURE_ID } from '../../helpers/fixtures';
import { restartAtWelcome, signInAs } from '../../helpers/session';
import { tap, waitForDisplayed } from '../../helpers/utils';

describe('Tenant notifications', () => {
  beforeEach(async () => {
    await restartAtWelcome();
    await signInAs('tenant');
    await tap('home-notifications-btn');
    await waitForDisplayed('notifications-screen');
  });

  it('opens a linked issue and marks all notifications read', async () => {
    await tap(`notification-item-${FIXTURE_ID.notificationIssue}`);
    await waitForDisplayed('tenant-issue-detail-screen');
    await driver.back();
    await waitForDisplayed('notifications-screen');
    await tap('notifications-mark-all-btn');
  });
});
