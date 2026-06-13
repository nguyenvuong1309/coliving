import { FIXTURE_ID } from '../../helpers/fixtures';
import { restartAtWelcome, signInAs } from '../../helpers/session';
import {
  acceptAlert,
  openBottomTab,
  tap,
  tapText,
  waitForDisplayed,
  waitForText,
} from '../../helpers/utils';

describe('Landlord payment management', () => {
  beforeEach(async () => {
    await restartAtWelcome();
    await signInAs('landlord');
    await openBottomTab('Thu tiền');
    await waitForDisplayed('landlord-payments-screen');
  });

  it('confirms a tenant-reported payment', async () => {
    await tap(`billing-item-${FIXTURE_ID.billingCurrent}`);
    await waitForDisplayed('payment-overview-screen');
    await tap(`payment-overview-item-${FIXTURE_ID.paymentReported}`);
    await waitForDisplayed('payment-confirm-screen');
    await tap('payment-confirm-btn');
    await acceptAlert('Xac nhan');
    await waitForDisplayed('payment-overview-screen');
  });

  it('creates the next billing period', async () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const month = currentMonth === 12 ? 1 : currentMonth + 1;
    const year =
      currentMonth === 12 ? now.getFullYear() + 1 : now.getFullYear();

    await tap('payments-create-btn');
    await waitForDisplayed('create-billing-screen');
    await tap(`billing-month-${month}`);
    await tap(`billing-year-${year}`);
    await tap('billing-submit-btn');
    await acceptAlert('Tao');
    await waitForDisplayed('landlord-payments-screen');
    await waitForText(`Thang ${month}/${year}`);
  });
});
