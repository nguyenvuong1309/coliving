import BasePage from '../BasePage';
import {tap} from '../../helpers/utils';

class TenantProfileScreen extends BasePage {
  readonly pageId = 'tenant-profile-screen';

  async tapEdit(): Promise<void> {
    await tap('tenant-profile-edit-btn');
  }

  async tapChangePassword(): Promise<void> {
    await tap('tenant-profile-password-btn');
  }

  async tapNotificationSettings(): Promise<void> {
    await tap('tenant-profile-notifications-btn');
  }

  async tapSignOut(): Promise<void> {
    await tap('tenant-profile-signout-btn');
  }
}

export default new TenantProfileScreen();
