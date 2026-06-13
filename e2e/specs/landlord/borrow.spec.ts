import { FIXTURE_ID } from '../../helpers/fixtures';
import { restartAtWelcome, signInAs } from '../../helpers/session';
import {
  acceptAlert,
  tap,
  tapExisting,
  waitForDisplayed,
  waitForExisting,
  waitForText,
} from '../../helpers/utils';

describe('Landlord borrow handling', () => {
  beforeEach(async () => {
    await restartAtWelcome();
    await signInAs('landlord');
    await tap('dashboard-borrow-requests-btn');
    await waitForDisplayed('landlord-borrow-list-screen');
  });

  it('filters and approves a pending borrow request', async () => {
    await tapExisting('landlord-borrow-filter-pending');
    await waitForExisting(`landlord-borrow-item-${FIXTURE_ID.borrowPending}`);
    await tap(`landlord-borrow-item-${FIXTURE_ID.borrowPending}`);
    await waitForDisplayed('landlord-borrow-detail-screen');
    await tap('landlord-borrow-approve-btn');
    await acceptAlert('Dong y');
    await waitForText('Duoc chap nhan');
  });
});
