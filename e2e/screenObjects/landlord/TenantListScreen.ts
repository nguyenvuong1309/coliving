import BasePage from '../BasePage';
import {tap, isExisting} from '../../helpers/utils';

class TenantListScreen extends BasePage {
  readonly pageId = 'tenant-list-screen';

  async openItem(id: string): Promise<void> {
    await tap(`tenant-item-${id}`);
  }

  async hasItem(id: string): Promise<boolean> {
    return isExisting(`tenant-item-${id}`);
  }

  async tapInvite(): Promise<void> {
    await tap('tenants-invite-btn');
  }
}

export default new TenantListScreen();
