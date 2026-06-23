import BasePage from '../BasePage';
import {tap} from '../../helpers/utils';

class LandlordProfileScreen extends BasePage {
  readonly pageId = 'landlord-profile-screen';

  async tapEdit(): Promise<void> {
    await tap('landlord-profile-edit-btn');
  }

  async tapChangePassword(): Promise<void> {
    await tap('landlord-profile-password-btn');
  }

  async tapNotificationSettings(): Promise<void> {
    await tap('landlord-profile-notifications-btn');
  }

  async tapRevenue(): Promise<void> {
    await tap('landlord-profile-revenue-btn');
  }

  async tapReport(): Promise<void> {
    await tap('landlord-profile-report-btn');
  }

  async tapUtility(): Promise<void> {
    await tap('landlord-profile-utility-btn');
  }

  async tapApartmentSwitcher(): Promise<void> {
    await tap('landlord-profile-apartment-switcher-btn');
  }

  async tapInvite(): Promise<void> {
    await tap('landlord-profile-invite-btn');
  }

  async tapSignOut(): Promise<void> {
    await tap('landlord-profile-signout-btn');
  }
}

export default new LandlordProfileScreen();
