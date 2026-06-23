import BasePage from '../BasePage';
import {tap, isExisting} from '../../helpers/utils';

type BorrowFilter = 'all' | 'pending' | 'in_use' | 'returned';

class BorrowListScreen extends BasePage {
  readonly pageId = 'tenant-borrow-list-screen';

  async filterBy(tab: BorrowFilter): Promise<void> {
    await tap(`borrow-filter-${tab}`);
  }

  async tapCreateFab(): Promise<void> {
    await tap('borrow-create-fab');
  }

  async openItem(id: string): Promise<void> {
    await tap(`borrow-item-${id}`);
  }

  async hasItem(id: string): Promise<boolean> {
    return isExisting(`borrow-item-${id}`);
  }
}

export default new BorrowListScreen();
