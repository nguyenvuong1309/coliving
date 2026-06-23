import BasePage from '../BasePage';
import {tap} from '../../helpers/utils';

class BorrowDetailScreen extends BasePage {
  readonly pageId = 'tenant-borrow-detail-screen';

  async tapRequestReturn(): Promise<void> {
    await tap('tenant-borrow-return-btn');
  }
}

export default new BorrowDetailScreen();
