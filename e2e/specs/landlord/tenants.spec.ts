import { FIXTURE_ID } from '../../helpers/fixtures';
import { restartAtWelcome, signInAs } from '../../helpers/session';
import {
  acceptAlert,
  isTextDisplayed,
  openBottomTab,
  tap,
  tapText,
  typeText,
  waitForDisplayed,
  waitForText,
} from '../../helpers/utils';

describe('Landlord tenant management', () => {
  beforeEach(async () => {
    await restartAtWelcome();
    await signInAs('landlord');
    await openBottomTab('Người thuê');
    await waitForDisplayed('tenant-list-screen');
  });

  it('opens invite code and copies it', async () => {
    await tap('tenants-invite-btn');
    await waitForDisplayed('invite-code-screen');
    await waitForText('E2E12345');
    await tap('invite-copy-btn');
    await acceptAlert();
  });

  it('updates and removes a tenant', async () => {
    await tap(`tenant-item-${FIXTURE_ID.tenant}`);
    await waitForDisplayed('tenant-detail-screen');
    await tap('tenant-detail-edit-btn');
    await waitForDisplayed('tenant-edit-screen');
    await typeText('tenant-edit-room-input', 'P201');
    await typeText('tenant-edit-rent-input', '4200000');
    await tap('tenant-edit-submit-btn');
    await waitForDisplayed('tenant-detail-screen');
    expect(await isTextDisplayed('P201')).toBe(true);

    await tap('tenant-detail-remove-btn');
    await acceptAlert('Xoa');
    await waitForDisplayed('tenant-list-screen');
    expect(await isTextDisplayed('E2E Nguoi Thue')).toBe(false);
  });
});
