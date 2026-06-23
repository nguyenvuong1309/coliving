import BasePage from '../BasePage';
import {tap, isExisting} from '../../helpers/utils';

class LandlordPaymentsScreen extends BasePage {
  readonly pageId = 'landlord-payments-screen';

  async openBilling(id: string): Promise<void> {
    await tap(`billing-item-${id}`);
  }

  async hasBilling(id: string): Promise<boolean> {
    return isExisting(`billing-item-${id}`);
  }

  async tapCreate(): Promise<void> {
    await tap('payments-create-btn');
  }
}

export default new LandlordPaymentsScreen();
