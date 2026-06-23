import BasePage from '../BasePage';
import {tap, typeText} from '../../helpers/utils';

class TenantEditScreen extends BasePage {
  readonly pageId = 'tenant-edit-screen';

  async enterRoom(room: string): Promise<void> {
    await typeText('tenant-edit-room-input', room);
  }

  async enterRent(rent: string): Promise<void> {
    await typeText('tenant-edit-rent-input', rent);
  }

  async tapSubmit(): Promise<void> {
    await tap('tenant-edit-submit-btn');
  }
}

export default new TenantEditScreen();
