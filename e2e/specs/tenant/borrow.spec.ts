import { FIXTURE_ID } from '../../helpers/fixtures';
import { restartAtWelcome, signInAs } from '../../helpers/session';
import {
  dismissKeyboard,
  openBottomTab,
  tap,
  tapExisting,
  tapText,
  TIMEOUT,
  typeText,
  waitForDisplayed,
  waitForExisting,
  waitForText,
} from '../../helpers/utils';

describe('Tenant borrow workflow', () => {
  beforeEach(async () => {
    await restartAtWelcome();
    await signInAs('tenant');
    await openBottomTab('Mượn đồ');
    await waitForDisplayed('tenant-borrow-list-screen');
  });

  it('filters requests and creates a borrow request', async () => {
    await tapExisting('borrow-filter-in_use');
    await waitForExisting(`borrow-item-${FIXTURE_ID.borrowInUse}`);

    await tapExisting('borrow-create-fab');
    await waitForDisplayed('tenant-borrow-create-screen');
    await tap(`borrow-asset-${FIXTURE_ID.assetWasher}`);
    await typeText('borrow-note-input', 'E2E muon them');
    await typeText('borrow-duration-input', '3 ngay');
    await dismissKeyboard();
    await tap('borrow-submit-btn');

    await waitForDisplayed('tenant-borrow-list-screen', TIMEOUT.long);
    await waitForText('May giat E2E');
  });

  it('requests return for an in-use asset', async () => {
    await tap(`borrow-item-${FIXTURE_ID.borrowInUse}`);
    await waitForDisplayed('tenant-borrow-detail-screen');
    await tap('tenant-borrow-return-btn');
    await waitForText('Yeu cau tra');
  });
});
