import BasePage from '../BasePage';
import {tap} from '../../helpers/utils';

class TenantHomeScreen extends BasePage {
  readonly pageId = 'tenant-home-screen';

  async tapCreateBorrow(): Promise<void> {
    await tap('home-borrow-create-btn');
  }

  async tapCreateIssue(): Promise<void> {
    await tap('home-issue-create-btn');
  }

  async tapRoommates(): Promise<void> {
    await tap('home-roommates-btn');
  }

  async tapNotifications(): Promise<void> {
    await tap('home-notifications-btn');
  }
}

export default new TenantHomeScreen();
