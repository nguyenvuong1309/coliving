import BasePage from '../BasePage';
import {tap, typeText} from '../../helpers/utils';

class ChangePasswordScreen extends BasePage {
  readonly pageId = 'change-password-screen';

  async enterNewPassword(password: string): Promise<void> {
    await typeText('change-password-new-input', password);
  }

  async enterConfirmPassword(password: string): Promise<void> {
    await typeText('change-password-confirm-input', password);
  }

  async tapSubmit(): Promise<void> {
    await tap('change-password-submit-btn');
  }

  async changePassword(newPassword: string, confirm = newPassword): Promise<void> {
    await this.enterNewPassword(newPassword);
    await this.enterConfirmPassword(confirm);
    await this.tapSubmit();
  }
}

export default new ChangePasswordScreen();
