import BasePage from '../BasePage';
import {tap} from '../../helpers/utils';

class NotificationSettingsScreen extends BasePage {
  readonly pageId = 'notification-settings-screen';

  async toggle(key: string): Promise<void> {
    await tap(`notification-setting-${key}`);
  }
}

export default new NotificationSettingsScreen();
