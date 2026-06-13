import { FIXTURE_ID } from '../../helpers/fixtures';
import { restartAtWelcome, signInAs } from '../../helpers/session';
import {
  openBottomTab,
  tap,
  tapExisting,
  tapText,
  typeText,
  waitForDisplayed,
  waitForExisting,
  waitForText,
} from '../../helpers/utils';

describe('Tenant issue workflow', () => {
  beforeEach(async () => {
    await restartAtWelcome();
    await signInAs('tenant');
    await openBottomTab('Sự cố');
    await waitForDisplayed('tenant-issue-list-screen');
  });

  it('filters and creates an urgent issue', async () => {
    await tapExisting('issue-filter-resolved');
    await waitForExisting(`issue-item-${FIXTURE_ID.issueResolved}`);

    await tapExisting('issue-create-fab');
    await waitForDisplayed('tenant-issue-create-screen');
    await tap('issue-category-equipment');
    await tap('issue-location-kitchen');
    await tap('issue-urgency-urgent');
    await typeText('issue-title-input', 'Bep hong E2E');
    await typeText('issue-description-input', 'Can kiem tra bep ngay');
    await tap('issue-submit-btn');

    await waitForDisplayed('tenant-issue-list-screen');
    await waitForText('Bep hong E2E');
  });

  it('closes a resolved issue', async () => {
    await tap(`issue-item-${FIXTURE_ID.issueResolved}`);
    await waitForDisplayed('tenant-issue-detail-screen');
    await tap('tenant-issue-close-btn');
    await waitForText('Da dong');
  });
});
