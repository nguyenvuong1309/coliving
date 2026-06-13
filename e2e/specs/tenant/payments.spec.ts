import { FIXTURE_ID } from '../../helpers/fixtures';
import { restartAtWelcome, signInAs } from '../../helpers/session';
import {
  acceptAlert,
  isTextDisplayed,
  openBottomTab,
  tap,
  tapText,
  waitForDisplayed,
  waitForText,
} from '../../helpers/utils';

describe('Tenant payment workflow', () => {
  beforeEach(async () => {
    await restartAtWelcome();
    await signInAs('tenant');
    await openBottomTab('Thanh toán');
    await waitForDisplayed('tenant-payment-history-screen');
  });

  it('shows payment history and reports a payment', async () => {
    await tap(`payment-item-${FIXTURE_ID.paymentUnpaid}`);
    await waitForDisplayed('tenant-payment-detail-screen');
    expect(await isTextDisplayed('Chi tiet so tien')).toBe(true);

    await tap('payment-report-btn');
    await acceptAlert();

    await tap('payment-method-cash');
    await tap('payment-report-btn');
    await waitForText('Dang cho xac nhan tu chu nha');
  });
});
