import BasePage from '../BasePage';
import {tap, isExisting} from '../../helpers/utils';

class PaymentOverviewScreen extends BasePage {
  readonly pageId = 'payment-overview-screen';

  async openItem(id: string): Promise<void> {
    await tap(`payment-overview-item-${id}`);
  }

  async hasItem(id: string): Promise<boolean> {
    return isExisting(`payment-overview-item-${id}`);
  }
}

export default new PaymentOverviewScreen();
