import BasePage from '../BasePage';
import {tap, isExisting} from '../../helpers/utils';

type BorrowFilter = 'all' | 'pending' | 'in_use' | 'returned';

class LandlordBorrowListScreen extends BasePage {
  readonly pageId = 'landlord-borrow-list-screen';

  async filterBy(tab: BorrowFilter): Promise<void> {
    await tap(`landlord-borrow-filter-${tab}`);
  }

  async openItem(id: string): Promise<void> {
    await tap(`landlord-borrow-item-${id}`);
  }

  async hasItem(id: string): Promise<boolean> {
    return isExisting(`landlord-borrow-item-${id}`);
  }
}

export default new LandlordBorrowListScreen();
