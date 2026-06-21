import { FIXTURE_ID } from '../../helpers/fixtures';
import { restartAtWelcome, signInAs } from '../../helpers/session';
import {
  acceptAlert,
  tap,
  tapExisting,
  typeText,
  waitForDisplayed,
  waitForExisting,
  waitForText,
} from '../../helpers/utils';

describe('Landlord issue handling', () => {
  beforeEach(async () => {
    await restartAtWelcome();
    await signInAs('landlord');
    await tap('dashboard-open-issues-btn');
    await waitForDisplayed('landlord-issue-list-screen');
  });

  it('filters and accepts an open issue', async () => {
    await tapExisting('landlord-issue-filter-open');
    await waitForExisting(`landlord-issue-item-${FIXTURE_ID.issueOpen}`);
    await tap(`landlord-issue-item-${FIXTURE_ID.issueOpen}`);
    await waitForDisplayed('landlord-issue-detail-screen');
    await typeText('landlord-issue-note-input', 'Da tiep nhan E2E');
    await tap('landlord-issue-action-btn');
    await acceptAlert('Dong y');
    await waitForText('Dang xu ly');
  });
});
