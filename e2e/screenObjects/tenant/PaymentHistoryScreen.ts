import BasePage from '../BasePage';
import {tap, isExisting} from '../../helpers/utils';

class PaymentHistoryScreen extends BasePage {
  readonly pageId = 'tenant-payment-history-screen';

  async openItem(id: string): Promise<void> {
    await tap(`payment-item-${id}`);
  }

  async hasItem(id: string): Promise<boolean> {
    return isExisting(`payment-item-${id}`);
  }
}

export default new PaymentHistoryScreen();
