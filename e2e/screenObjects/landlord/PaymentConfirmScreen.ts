import BasePage from '../BasePage';
import {tap} from '../../helpers/utils';

class PaymentConfirmScreen extends BasePage {
  readonly pageId = 'payment-confirm-screen';

  async tapConfirm(): Promise<void> {
    await tap('payment-confirm-btn');
  }

  async tapReject(): Promise<void> {
    await tap('payment-reject-btn');
  }
}

export default new PaymentConfirmScreen();
