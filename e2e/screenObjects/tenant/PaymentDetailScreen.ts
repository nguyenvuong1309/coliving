import BasePage from '../BasePage';
import {tap} from '../../helpers/utils';

class PaymentDetailScreen extends BasePage {
  readonly pageId = 'tenant-payment-detail-screen';

  async selectMethod(value: string): Promise<void> {
    await tap(`payment-method-${value}`);
  }

  async tapAddReceipt(): Promise<void> {
    await tap('payment-add-receipt-btn');
  }

  async tapReport(): Promise<void> {
    await tap('payment-report-btn');
  }
}

export default new PaymentDetailScreen();
