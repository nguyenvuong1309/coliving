import BasePage from '../BasePage';
import {tap} from '../../helpers/utils';

class TenantDetailScreen extends BasePage {
  readonly pageId = 'tenant-detail-screen';

  async tapEdit(): Promise<void> {
    await tap('tenant-detail-edit-btn');
  }

  async tapRemove(): Promise<void> {
    await tap('tenant-detail-remove-btn');
  }
}

export default new TenantDetailScreen();
