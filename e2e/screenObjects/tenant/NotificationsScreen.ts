import BasePage from '../BasePage';
import {tap, isExisting} from '../../helpers/utils';

class NotificationsScreen extends BasePage {
  readonly pageId = 'notifications-screen';

  async openItem(id: string): Promise<void> {
    await tap(`notification-item-${id}`);
  }

  async hasItem(id: string): Promise<boolean> {
    return isExisting(`notification-item-${id}`);
  }

  async tapMarkAll(): Promise<void> {
    await tap('notifications-mark-all-btn');
  }
}

export default new NotificationsScreen();
