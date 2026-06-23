import BasePage from '../BasePage';
import {tap, typeText} from '../../helpers/utils';

class EditProfileScreen extends BasePage {
  readonly pageId = 'edit-profile-screen';

  async enterName(name: string): Promise<void> {
    await typeText('edit-profile-name-input', name);
  }

  async enterPhone(phone: string): Promise<void> {
    await typeText('edit-profile-phone-input', phone);
  }

  async tapSubmit(): Promise<void> {
    await tap('edit-profile-submit-btn');
  }

  async update(name: string, phone: string): Promise<void> {
    await this.enterName(name);
    await this.enterPhone(phone);
    await this.tapSubmit();
  }
}

export default new EditProfileScreen();
